import { Injectable } from '@nestjs/common';
import {
  ScholarsRecommendationEngine,
  type ScholarsRecommendationPage,
} from './scholars-recommendation.engine';

@Injectable()
/** Exposes the internal Scholars page-feed recommendation boundary to the caller. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarsRecommendationService {
  constructor(private readonly engine: ScholarsRecommendationEngine) {}

  /** Returns one ordered sequence page without exposing database policy to clients. */
  recommend(cursor?: string, limit?: number): Promise<ScholarsRecommendationPage> {
    return this.engine.recommend(cursor, limit);
  }
}
