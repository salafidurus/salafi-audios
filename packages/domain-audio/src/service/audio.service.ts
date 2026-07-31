import { httpClient, endpoints } from "@sd/core-contracts";

import type { PlaybackEngine } from "../engine/playback.engine";
import type { Track } from "../types/track.types";

import { useProgressStore } from "../progress/progress.store";
import { syncProgressToBackend } from "../progress/progress.sync";
import { QueueManager } from "../queue/queue.manager";
import { usePlaybackStore } from "../store/playback.store";

type StreamUrlResponse = { url: string };

type PlayOptions = {
  /** Skip resuming from any saved position and start the track from 0. */
  fromStart?: boolean;
};

/** Below this many seconds into the current track, skipToPrevious() restarts it instead of going back. */
const SKIP_PREVIOUS_RESTART_THRESHOLD_SECONDS = 3;

export class DurusAudioService {
  private readonly queueManager = new QueueManager();

  constructor(private readonly engine: PlaybackEngine) {
    this.engine.setEvents({
      onTrackEnd: () => this.onTrackEnd(),
      onStatusChange: (status) => usePlaybackStore.getState().actions.setStatus(status),
      onPositionChange: (pos) => this.onPositionChange(pos),
      onDurationChange: (dur) => usePlaybackStore.getState().actions.setDuration(dur),
      onError: (err) => usePlaybackStore.getState().actions.setError(err),
    });
  }

  async playListing(track: Track, queueContext?: Track[], options: PlayOptions = {}) {
    if (queueContext && queueContext.length > 0) {
      const index = queueContext.findIndex((t) => t.id === track.id);
      this.queueManager.setQueue(queueContext, index >= 0 ? index : 0);
    } else {
      this.queueManager.setQueue([track], 0);
    }
    this.syncQueueState();

    await this.loadAndPlay(track, options);
  }

  async skipToNext() {
    if (this.queueManager.hasNext()) {
      const nextTrack = this.queueManager.advance();
      this.syncQueueState();
      if (nextTrack) {
        await this.loadAndPlay(nextTrack);
      }
    } else {
      await this.stop();
    }
  }

  async skipToPrevious() {
    const position = usePlaybackStore.getState().positionSeconds;
    if (position > SKIP_PREVIOUS_RESTART_THRESHOLD_SECONDS || !this.queueManager.hasPrevious()) {
      await this.seek(0);
      return;
    }

    const prevTrack = this.queueManager.previous();
    this.syncQueueState();
    if (prevTrack) {
      await this.loadAndPlay(prevTrack);
    }
  }

  /** Loads and plays a track that is already positioned correctly in the queue. */
  private async loadAndPlay(track: Track, options: PlayOptions = {}) {
    usePlaybackStore.getState().actions.setCurrentTrack(track);
    usePlaybackStore.getState().actions.setStatus("loading");

    const resolvedTrack = await this.resolveStreamUrl(track);
    await this.engine.load(resolvedTrack);
    if (!options.fromStart) {
      await this.applyResumePosition(resolvedTrack);
    }
    await this.engine.play();

    this.prefetchNextTrack();
  }

  private async applyResumePosition(track: Track) {
    const saved = useProgressStore.getState().actions.getProgress(track.id);
    if (saved && !saved.completedAt && saved.positionSeconds > 0) {
      await this.engine.seek(saved.positionSeconds);
    }
  }

  /**
   * Best-effort background resolution of the next queued track's stream URL,
   * so skipToNext()/auto-advance doesn't block on a network round-trip.
   */
  private prefetchNextTrack() {
    const nextTrack = this.queueManager.getNextTrack();
    if (!nextTrack || nextTrack.url) return;

    this.resolveStreamUrl(nextTrack)
      .then((resolved) => {
        nextTrack.url = resolved.url;
      })
      .catch(() => {
        // Best-effort — falls back to lazy resolution when it's actually played.
      });
  }

  private syncQueueState() {
    usePlaybackStore
      .getState()
      .actions.setQueueState(this.queueManager.getQueue(), this.queueManager.getCurrentIndex());
  }

  /**
   * Resolves a fresh signed stream URL for the given track.
   *
   * Local file URIs (file://) are passed through unchanged. Remote URLs that
   * are present are also trusted as-is (they were just-resolved by the caller).
   * An empty URL indicates a lazy stub for series continuation — in this case
   * the service fetches a fresh signed URL from the backend.
   */
  private async resolveStreamUrl(track: Track): Promise<Track> {
    if (track.url && !track.url.startsWith("file://")) {
      // Already has a usable remote URL — no need to re-resolve.
      return track;
    }

    if (track.url.startsWith("file://")) {
      // Local file — pass through unchanged.
      return track;
    }

    // Empty URL stub (series continuation) — lazily fetch a fresh signed URL.
    const { url } = await httpClient<StreamUrlResponse>({
      url: endpoints.audio.listings.stream(track.id),
      method: "GET",
    });

    return { ...track, url };
  }

  async pause() {
    await this.engine.pause();
  }

  async resume() {
    await this.engine.play();
  }

  async seek(seconds: number) {
    await this.engine.seek(seconds);
  }

  async setSpeed(speed: number) {
    await this.engine.setSpeed(speed);
    usePlaybackStore.getState().actions.setSpeed(speed);
  }

  async stop() {
    await this.engine.stop();
    this.queueManager.clear();
    usePlaybackStore.getState().actions.stop();
  }

  private async onTrackEnd() {
    const currentTrack = usePlaybackStore.getState().currentTrack;
    if (currentTrack) {
      // Ensure a progress entry exists before marking it completed — track-end
      // can fire without a preceding position tick (e.g. a very short track).
      const duration = usePlaybackStore.getState().durationSeconds;
      useProgressStore.getState().actions.setProgress(currentTrack.id, duration, duration);
      useProgressStore.getState().actions.markCompleted(currentTrack.id);
    }
    await this.skipToNext();
  }

  private onPositionChange(positionSeconds: number) {
    usePlaybackStore.getState().actions.setPosition(positionSeconds);
    const currentTrack = usePlaybackStore.getState().currentTrack;
    if (currentTrack) {
      const duration = usePlaybackStore.getState().durationSeconds;
      useProgressStore.getState().actions.setProgress(currentTrack.id, positionSeconds, duration);

      // debounced sync to server
      syncProgressToBackend({
        listingId: currentTrack.id,
        positionSeconds,
        durationSeconds: duration,
      });
    }
  }
}
