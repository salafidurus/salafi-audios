import type { PlaybackEngine, PlaybackEngineEvents, Track } from "@sd/domain-audio";

export class HTMLAudioAdapter implements PlaybackEngine {
  private audio: HTMLAudioElement | null = null;
  private events: PlaybackEngineEvents = {};
  private activeListeners: { [K in string]?: (e: Event) => void } = {};

  async setup(): Promise<void> {
    if (typeof window === "undefined") return;

    if (!this.audio) {
      this.audio = new Audio();
      this.bindListeners();
    }
  }

  async load(track: Track): Promise<void> {
    // react-doctor-disable-next-line react-doctor/async-defer-await
    await this.setup();
    if (!this.audio) return;

    if (this.events.onStatusChange) {
      this.events.onStatusChange("loading");
    }

    this.audio.src = track.url;
    this.audio.load();
  }

  async play(): Promise<void> {
    if (!this.audio) return;
    try {
      await this.audio.play();
    } catch (err) {
      if (this.events.onError) {
        const message = err instanceof Error ? err.message : "Error playing audio";
        this.events.onError(message);
      }
    }
  }

  async pause(): Promise<void> {
    if (!this.audio) return;
    this.audio.pause();
  }

  async seek(positionSeconds: number): Promise<void> {
    if (!this.audio) return;
    this.audio.currentTime = positionSeconds;
  }

  async setSpeed(speed: number): Promise<void> {
    if (!this.audio) return;
    this.audio.playbackRate = speed;
    this.audio.defaultPlaybackRate = speed;
  }

  async stop(): Promise<void> {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    if (this.events.onStatusChange) {
      this.events.onStatusChange("idle");
    }
  }

  async destroy(): Promise<void> {
    if (this.audio) {
      this.unbindListeners();
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
  }

  setEvents(events: PlaybackEngineEvents): void {
    this.events = events;
  }

  private bindListeners() {
    if (!this.audio) return;

    const timeUpdate = () => {
      if (this.events.onPositionChange && this.audio) {
        this.events.onPositionChange(this.audio.currentTime);
      }
    };

    const durationChange = () => {
      if (this.events.onDurationChange && this.audio) {
        this.events.onDurationChange(this.audio.duration);
      }
    };

    const ended = () => {
      if (this.events.onTrackEnd) {
        this.events.onTrackEnd();
      }
    };

    const playing = () => {
      if (this.events.onStatusChange) {
        this.events.onStatusChange("playing");
      }
    };

    const paused = () => {
      if (this.events.onStatusChange && this.audio && !this.audio.ended) {
        this.events.onStatusChange("paused");
      }
    };

    const waiting = () => {
      if (this.events.onStatusChange) {
        this.events.onStatusChange("loading");
      }
    };

    const error = () => {
      if (this.events.onError && this.audio) {
        this.events.onError(this.audio.error?.message || "HTMLAudioElement error");
      }
    };

    this.audio.addEventListener("timeupdate", timeUpdate);
    this.audio.addEventListener("durationchange", durationChange);
    this.audio.addEventListener("ended", ended);
    this.audio.addEventListener("playing", playing);
    this.audio.addEventListener("pause", paused);
    this.audio.addEventListener("waiting", waiting);
    this.audio.addEventListener("error", error);

    this.activeListeners = {
      timeupdate: timeUpdate,
      durationchange: durationChange,
      ended,
      playing,
      pause: paused,
      waiting,
      error,
    };
  }

  private unbindListeners() {
    if (!this.audio) return;

    Object.entries(this.activeListeners).forEach(([event, listener]) => {
      if (listener) {
        this.audio?.removeEventListener(event, listener);
      }
    });

    this.activeListeners = {};
  }
}
