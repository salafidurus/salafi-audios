import { Injectable } from '@nestjs/common';
import { ScholarPageFeedRepo, type ScholarPageFeedRecommendation } from './scholar-page-feed.repo';

@Injectable()
/** Runs the deterministic strategy for the root Scholars page feed. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarPageFeedEngine {
  constructor(private readonly repo: ScholarPageFeedRepo) {}

  /** Keeps selection and ordering behind an internal strategy boundary. */
  recommend(): Promise<ScholarPageFeedRecommendation[]> {
    return this.repo.getRecommendations();
  }
}
