import type { PlaybackEngine, Track } from "../types";
import { usePlaybackStore } from "../store/playback.store";

/**
 * Native playback engine stub.
 *
 * Full implementation requires react-native-track-player which
 * provides background audio, lock screen controls, and queue management.
 * This stub satisfies the type contract; the real implementation will
 * be wired when react-native-track-player is installed.
 */

let positionInterval: ReturnType<typeof setInterval> | null = null;

function clearPositionSync() {
  if (positionInterval) {
    clearInterval(positionInterval);
    positionInterval = null;
  }
}

export const nativePlaybackEngine: PlaybackEngine = {
  async setup() {
    // TODO: TrackPlayer.setupPlayer()
  },

  async play(_track: Track) {
    const { actions } = usePlaybackStore.getState();
    // TODO: TrackPlayer.add(track) + TrackPlayer.play()
    actions.setStatus("playing");

    // Simulated position sync — replace with TrackPlayer event listeners
    clearPositionSync();
    positionInterval = setInterval(() => {
      const state = usePlaybackStore.getState();
      if (state.status === "playing") {
        actions.setPosition(state.positionSeconds + 1);
      }
    }, 1000);
  },

  async pause() {
    // TODO: TrackPlayer.pause()
    usePlaybackStore.getState().actions.setStatus("paused");
  },

  async resume() {
    // TODO: TrackPlayer.play()
    usePlaybackStore.getState().actions.setStatus("playing");
  },

  async seek(positionSeconds: number) {
    // TODO: TrackPlayer.seekTo(positionSeconds)
    usePlaybackStore.getState().actions.setPosition(positionSeconds);
  },

  async stop() {
    clearPositionSync();
    // TODO: TrackPlayer.reset()
    usePlaybackStore.getState().actions.stop();
  },

  async destroy() {
    clearPositionSync();
    // TODO: TrackPlayer.destroy()
  },
};
