import { httpClient, endpoints } from "@sd/core-contracts";
import type { PlaybackEngine } from "../engine/playback.engine";
import { QueueManager } from "../queue/queue.manager";
import { usePlaybackStore } from "../store/playback.store";
import { useProgressStore } from "../progress/progress.store";
import { syncProgressToBackend } from "../progress/progress.sync";
import type { Track } from "../types/track.types";

type StreamUrlResponse = { url: string };

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

  async playListing(track: Track, queueContext?: Track[]) {
    if (queueContext && queueContext.length > 0) {
      const index = queueContext.findIndex((t) => t.id === track.id);
      this.queueManager.setQueue(queueContext, index >= 0 ? index : 0);
    } else {
      this.queueManager.setQueue([track], 0);
    }

    usePlaybackStore.getState().actions.setCurrentTrack(track);
    usePlaybackStore.getState().actions.setStatus("loading");

    const resolvedTrack = await this.resolveStreamUrl(track);
    await this.engine.load(resolvedTrack);
    await this.engine.play();
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

  async skipToNext() {
    if (this.queueManager.hasNext()) {
      const nextTrack = this.queueManager.advance();
      if (nextTrack) {
        await this.playListing(nextTrack);
      }
    } else {
      await this.stop();
    }
  }

  async stop() {
    await this.engine.stop();
    this.queueManager.clear();
    usePlaybackStore.getState().actions.stop();
  }

  private async onTrackEnd() {
    // Mark current track as completed
    const currentTrack = usePlaybackStore.getState().currentTrack;
    if (currentTrack) {
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
