import type { Track } from "../types/track.types";

export class QueueManager {
  private queue: Track[] = [];
  private currentIndex = -1;

  setQueue(tracks: Track[], startIndex = 0) {
    this.queue = tracks;
    this.currentIndex = startIndex;
  }

  getCurrentTrack(): Track | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex] ?? null;
    }
    return null;
  }

  advance(): Track | null {
    if (this.hasNext()) {
      this.currentIndex++;
      return this.getCurrentTrack();
    }
    return null;
  }

  previous(): Track | null {
    if (this.hasPrevious()) {
      this.currentIndex--;
      return this.getCurrentTrack();
    }
    return null;
  }

  jumpTo(index: number): Track | null {
    if (index >= 0 && index < this.queue.length) {
      this.currentIndex = index;
      return this.getCurrentTrack();
    }
    return null;
  }

  hasNext(): boolean {
    return this.currentIndex + 1 < this.queue.length;
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /** Peek the next track without advancing the current position. */
  getNextTrack(): Track | null {
    if (this.hasNext()) {
      return this.queue[this.currentIndex + 1] ?? null;
    }
    return null;
  }

  /** Peek the previous track without moving the current position. */
  getPreviousTrack(): Track | null {
    if (this.hasPrevious()) {
      return this.queue[this.currentIndex - 1] ?? null;
    }
    return null;
  }

  getQueue(): Track[] {
    return this.queue;
  }

  clear() {
    this.queue = [];
    this.currentIndex = -1;
  }
}
