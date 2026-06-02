import { Track } from '../types/track.types';

export class QueueManager {
  private queue: Track[] = [];
  private currentIndex = -1;

  setQueue(tracks: Track[], startIndex = 0) {
    this.queue = tracks;
    this.currentIndex = startIndex;
  }

  getCurrentTrack(): Track | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex];
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

  hasNext(): boolean {
    return this.currentIndex + 1 < this.queue.length;
  }

  getQueue(): Track[] {
    return this.queue;
  }

  clear() {
    this.queue = [];
    this.currentIndex = -1;
  }
}
