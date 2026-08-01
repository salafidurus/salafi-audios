import type { PlaybackEngine, PlaybackEngineEvents, Track, PlaybackStatus } from "@sd/domain-audio";
import type { AudioPlayer, AudioStatus } from "expo-audio";

import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

export class ExpoAudioAdapter implements PlaybackEngine {
  private player: AudioPlayer | null = null;
  private events: PlaybackEngineEvents = {};
  private listeners: { remove: () => void }[] = [];
  private hasEnded = false;
  private audioModeConfigured = false;

  async setup(): Promise<void> {
    if (this.audioModeConfigured) return;
    this.audioModeConfigured = true;
    // doNotMix is required for lock-screen controls to associate with this
    // player (see setActiveForLockScreen); shouldPlayInBackground also keeps
    // Android alive past the ~3min OS limit once lock-screen controls are active.
    await setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    });
  }

  async load(track: Track): Promise<void> {
    await this.setup();
    this.cleanup();
    this.hasEnded = false;

    const player = createAudioPlayer({ uri: track.url }, { updateInterval: 500 });
    this.player = player;
    player.setActiveForLockScreen(
      true,
      { title: track.title, artist: track.artist, artworkUrl: track.artworkUrl },
      { showSeekBackward: true, showSeekForward: true },
    );

    // Bind event listeners
    const statusListener = player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
      // 1. Map and trigger status change
      const mappedStatus = this.mapStatus(status);
      if (this.events.onStatusChange) {
        this.events.onStatusChange(mappedStatus);
      }

      // 2. Trigger position change — currentTime is already in seconds
      if (this.events.onPositionChange) {
        this.events.onPositionChange(status.currentTime);
      }

      // 3. Trigger duration change — duration is already in seconds
      if (this.events.onDurationChange && status.duration > 0) {
        this.events.onDurationChange(status.duration);
      }

      // 4. Trigger completion via didJustFinish
      if (status.didJustFinish && !this.hasEnded) {
        this.hasEnded = true;
        if (this.events.onTrackEnd) {
          this.events.onTrackEnd();
        }
      }
    });

    this.listeners.push(statusListener);

    // Set duration initially if available
    if (player.duration && this.events.onDurationChange) {
      this.events.onDurationChange(player.duration);
    }
  }

  async play(): Promise<void> {
    if (this.player) {
      this.player.play();
    }
  }

  async pause(): Promise<void> {
    if (this.player) {
      this.player.pause();
    }
  }

  async seek(positionSeconds: number): Promise<void> {
    if (this.player) {
      // seekTo takes seconds
      await this.player.seekTo(positionSeconds);
    }
  }

  async setSpeed(speed: number): Promise<void> {
    if (this.player) {
      this.player.setPlaybackRate(speed);
    }
  }

  async stop(): Promise<void> {
    if (this.player) {
      this.player.pause();
      await this.player.seekTo(0);
      this.player.clearLockScreenControls();
    }
  }

  async destroy(): Promise<void> {
    this.cleanup();
  }

  setEvents(events: PlaybackEngineEvents): void {
    this.events = events;
  }

  private cleanup() {
    for (const listener of this.listeners) {
      listener.remove();
    }
    this.listeners = [];

    if (this.player) {
      this.player.clearLockScreenControls();
      this.player.remove();
      this.player = null;
    }
  }

  private mapStatus(status: AudioStatus): PlaybackStatus {
    if (!status.isLoaded) return "loading";
    if (status.isBuffering) return "loading";
    if (status.playing) return "playing";
    return "paused";
  }
}
