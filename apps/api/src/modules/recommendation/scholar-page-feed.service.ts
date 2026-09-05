import { Injectable } from '@nestjs/common';
import { ScholarPageFeedEngine } from './scholar-page-feed.engine';
import type { ScholarPageFeedRecommendation } from './scholar-page-feed.repo';

@Injectable()
/** Exposes the internal Scholars page-feed recommendation boundary to the caller. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarPageFeedService {
  constructor(private readonly engine: ScholarPageFeedEngine) {}

  /** Returns ordered entity references without exposing database policy to clients. */
  recommend(): Promise<ScholarPageFeedRecommendation> {
    return this.engine.recommend();
  }
}
