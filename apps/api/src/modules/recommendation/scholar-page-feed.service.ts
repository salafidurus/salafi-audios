import { Injectable } from '@nestjs/common';
import {
  ScholarPageFeedEngine,
  type ScholarPageFeedRecommendationPage,
} from './scholar-page-feed.engine';

@Injectable()
/** Exposes the internal Scholars page-feed recommendation boundary to the caller. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarPageFeedService {
  constructor(private readonly engine: ScholarPageFeedEngine) {}

  /** Returns one ordered sequence page without exposing database policy to clients. */
  recommend(cursor?: string, limit?: number): Promise<ScholarPageFeedRecommendationPage> {
    return this.engine.recommend(cursor, limit);
  }
}
