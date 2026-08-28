import type { PlaybackEngine, PlaybackEngineEvents, Track, PlaybackStatus } from "@sd/domain-audio";
import type { AudioPlayer, AudioStatus } from "expo-audio";

import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

/** Provides the native features audio engine expo-audio.adapter module responsibility. */
/** Describes the ExpoAudioAdapter native class contract and behavior. */
export class ExpoAudioAdapter implements PlaybackEngine {
  private player: AudioPlayer | null = null;
  private events: PlaybackEngineEvents = {};
  private listeners: { remove: () => void }[] = [];
  private hasEnded = false;
  private audioModeConfigured = false;

  private handleStatusUpdate(status: AudioStatus): void {
    const mappedStatus = this.mapStatus(status);
    this.events.onStatusChange?.(mappedStatus);
    this.events.onPositionChange?.(status.currentTime);
    this.notifyDuration(status.duration);
    this.notifyTrackEnd(status.didJustFinish);
  }

  private notifyDuration(duration: number): void {
    if (this.events.onDurationChange && duration > 0) {
      this.events.onDurationChange(duration);
    }
  }

  private notifyTrackEnd(didJustFinish: boolean): void {
    if (didJustFinish && !this.hasEnded) {
      this.hasEnded = true;
      this.events.onTrackEnd?.();
    }
  }

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
    const statusListener = player.addListener("playbackStatusUpdate", (status: AudioStatus) =>
      this.handleStatusUpdate(status),
    );

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
