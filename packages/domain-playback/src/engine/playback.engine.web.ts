import type { PlaybackEngine, Track } from "../types";
import { usePlaybackStore } from "../store/playback.store";

let audio: HTMLAudioElement | null = null;
let animationFrame: number | null = null;

function syncPosition() {
  if (audio && !audio.paused) {
    usePlaybackStore.getState().actions.setPosition(audio.currentTime);
    animationFrame = requestAnimationFrame(syncPosition);
  }
}

export const webPlaybackEngine: PlaybackEngine = {
  async setup() {
    // No setup needed for web
  },

  async play(track: Track) {
    if (audio) {
      audio.pause();
      audio.src = "";
    }

    audio = new Audio(track.audioUrl);
    const { actions } = usePlaybackStore.getState();

    audio.addEventListener("loadedmetadata", () => {
      if (audio) {
        actions.setDuration(audio.duration);
      }
    });

    audio.addEventListener("playing", () => {
      actions.setStatus("playing");
      animationFrame = requestAnimationFrame(syncPosition);
    });

    audio.addEventListener("pause", () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      actions.setStatus("paused");
    });

    audio.addEventListener("ended", () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      usePlaybackStore.getState().actions.skipToNext();
    });

    audio.addEventListener("error", () => {
      actions.setError("Failed to load audio");
    });

    await audio.play();
  },

  async pause() {
    audio?.pause();
  },

  async resume() {
    await audio?.play();
  },

  async seek(positionSeconds: number) {
    if (audio) {
      audio.currentTime = positionSeconds;
      usePlaybackStore.getState().actions.setPosition(positionSeconds);
    }
  },

  async stop() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (audio) {
      audio.pause();
      audio.src = "";
      audio = null;
    }
  },

  async destroy() {
    await this.stop();
  },
};
