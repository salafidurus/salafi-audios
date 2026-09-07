import { endpoints, httpClient } from "@sd/core-contracts";

import type { PlaybackEngine } from "../engine/playback.engine";
import type { Track } from "../types/track.types";

import { useProgressStore } from "../progress/progress.store";
import { flushPendingProgress, syncProgressToBackend } from "../progress/progress.sync";
import { QueueManager } from "../queue/queue.manager";
import { usePlaybackStore } from "../store/playback.store";

/** Platform-neutral orchestration module for a Listening session lifecycle. */
type StreamUrlResponse = { url: string };

/** Options controlling resume behavior when starting a track. */
export type ListeningPlayOptions = {
  /** Skip resuming from any saved position and start the track from 0. */
  fromStart?: boolean;
};

/** Below this many seconds, previous restarts the current track. */
const SKIP_PREVIOUS_RESTART_THRESHOLD_SECONDS = 3;
const LISTENING_MILESTONES = [0.3, 0.5, 0.75] as const;

/** Non-blocking product observations emitted by the shared listening lifecycle. */
export type ListeningAnalyticsObserver = {
  onStarted?: (track: Track) => void | Promise<void>;
  onMilestone?: (
    track: Track,
    milestone: (typeof LISTENING_MILESTONES)[number],
  ) => void | Promise<void>;
  onCompletedObserved?: (track: Track) => void | Promise<void>;
};

/**
 * Platform-neutral Listening orchestration.
 *
 * Playback engines and local-source resolution are injected adapters. Queue
 * movement, resume, natural-end completion, and Progress intent remain one
 * shared domain rule for web and native clients.
 */
export class ListeningSession {
  private readonly queueManager = new QueueManager();
  private analyticsObserver?: ListeningAnalyticsObserver;
  private readonly milestones = new Set<string>();
  private readonly startedTracks = new Set<string>();

  setAnalyticsObserver(observer: ListeningAnalyticsObserver | undefined): void {
    this.analyticsObserver = observer;
  }

  constructor(
    private readonly engine: PlaybackEngine,
    private readonly localUriResolver?: (track: Track) => Promise<string | undefined>,
  ) {
    this.engine.setEvents({
      onTrackEnd: () => this.onTrackEnd(),
      onStatusChange: (status) => {
        usePlaybackStore.getState().actions.setStatus(status);
        if (status === "playing") {
          const track = usePlaybackStore.getState().currentTrack;
          if (track && !this.startedTracks.has(track.slug)) {
            this.startedTracks.add(track.slug);
            void this.observe(() => this.analyticsObserver?.onStarted?.(track));
          }
        }
      },
      onPositionChange: (position) => this.onPositionChange(position),
      onDurationChange: (duration) => usePlaybackStore.getState().actions.setDuration(duration),
      onError: (error) => usePlaybackStore.getState().actions.setError(error),
      onSkipPrevious: () => this.skipToPrevious(),
      onSkipNext: () => this.skipToNext(),
    });
  }

  async playListing(
    track: Track,
    queueContext?: Track[],
    options: ListeningPlayOptions = {},
  ): Promise<void> {
    if (queueContext && queueContext.length > 0) {
      const index = queueContext.findIndex((candidate) => candidate.id === track.id);
      this.queueManager.setQueue(queueContext, index >= 0 ? index : 0);
    } else {
      this.queueManager.setQueue([track], 0);
    }
    this.syncQueueState();

    await this.loadAndPlay(track, options);
  }

  async skipToNext(): Promise<void> {
    if (this.queueManager.hasNext()) {
      const nextTrack = this.queueManager.advance();
      this.syncQueueState();
      if (nextTrack) await this.loadAndPlay(nextTrack);
      return;
    }

    await this.stop();
  }

  async skipToPrevious(): Promise<void> {
    const position = usePlaybackStore.getState().positionSeconds;
    if (position > SKIP_PREVIOUS_RESTART_THRESHOLD_SECONDS || !this.queueManager.hasPrevious()) {
      await this.seek(0);
      return;
    }

    const previousTrack = this.queueManager.previous();
    this.syncQueueState();
    if (previousTrack) await this.loadAndPlay(previousTrack);
  }

  async pause(): Promise<void> {
    await this.engine.pause();
  }

  async resume(): Promise<void> {
    await this.engine.play();
  }

  async seek(seconds: number): Promise<void> {
    await this.engine.seek(seconds);
  }

  async setSpeed(speed: number): Promise<void> {
    await this.engine.setSpeed(speed);
    usePlaybackStore.getState().actions.setSpeed(speed);
  }

  async stop(): Promise<void> {
    await this.engine.stop();
    this.queueManager.clear();
    usePlaybackStore.getState().actions.stop();
  }

  private async loadAndPlay(track: Track, options: ListeningPlayOptions = {}): Promise<void> {
    for (const key of this.milestones)
      if (key.startsWith(`${track.slug}:`)) this.milestones.delete(key);
    this.startedTracks.delete(track.slug);
    usePlaybackStore.getState().actions.setCurrentTrack(track);
    usePlaybackStore.getState().actions.setStatus("loading");

    const resolvedTrack = await this.resolveStreamUrl(track);
    await this.engine.load(resolvedTrack);
    if (!options.fromStart) await this.applyResumePosition(resolvedTrack);
    await this.engine.play();

    this.prefetchNextTrack();
  }

  private async applyResumePosition(track: Track): Promise<void> {
    const saved = useProgressStore.getState().actions.getProgress(track.slug);
    if (saved && !saved.completedAt && saved.positionSeconds > 0) {
      await this.engine.seek(saved.positionSeconds);
    }
  }

  private prefetchNextTrack(): void {
    const nextTrack = this.queueManager.getNextTrack();
    if (!nextTrack || nextTrack.url) return;

    this.resolveStreamUrl(nextTrack)
      .then((resolved) => {
        nextTrack.url = resolved.url;
      })
      .catch(() => {
        // Resolution is best-effort; playback resolves lazily if needed.
      });
  }

  private syncQueueState(): void {
    usePlaybackStore
      .getState()
      .actions.setQueueState(this.queueManager.getQueue(), this.queueManager.getCurrentIndex());
  }

  private async resolveStreamUrl(track: Track): Promise<Track> {
    if (track.url.startsWith("file://")) return track;

    const localUri = await this.localUriResolver?.(track);
    if (localUri) return { ...track, url: localUri };
    if (track.url) return track;

    const { url } = await httpClient<StreamUrlResponse>({
      url: endpoints.audio.listings.stream(track.slug),
      method: "GET",
    });

    return { ...track, url };
  }

  private async onTrackEnd(): Promise<void> {
    const currentTrack = usePlaybackStore.getState().currentTrack;
    if (currentTrack) {
      void this.observe(() => this.analyticsObserver?.onCompletedObserved?.(currentTrack));
      const duration = usePlaybackStore.getState().durationSeconds;
      useProgressStore.getState().actions.setProgress(currentTrack.slug, duration, duration);
      useProgressStore.getState().actions.markCompleted(currentTrack.slug);
      syncProgressToBackend({
        listingSlug: currentTrack.slug,
        positionSeconds: duration,
        durationSeconds: duration,
      });
      await flushPendingProgress();
    }

    await this.skipToNext();
  }

  private onPositionChange(positionSeconds: number): void {
    usePlaybackStore.getState().actions.setPosition(positionSeconds);
    const currentTrack = usePlaybackStore.getState().currentTrack;
    if (!currentTrack) return;

    const duration = usePlaybackStore.getState().durationSeconds;
    useProgressStore.getState().actions.setProgress(currentTrack.slug, positionSeconds, duration);
    syncProgressToBackend({
      listingSlug: currentTrack.slug,
      positionSeconds,
      durationSeconds: duration,
    });
    if (duration > 0) {
      for (const milestone of LISTENING_MILESTONES) {
        const key = `${currentTrack.slug}:${milestone}`;
        if (positionSeconds / duration >= milestone && !this.milestones.has(key)) {
          this.milestones.add(key);
          void this.observe(() => this.analyticsObserver?.onMilestone?.(currentTrack, milestone));
        }
      }
    }
  }

  private async observe(callback: () => void | Promise<void>): Promise<void> {
    try {
      await callback();
    } catch {
      // Analytics is best-effort and must never affect playback or progress.
    }
  }
}
