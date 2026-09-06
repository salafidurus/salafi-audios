import { BadRequestException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  ScholarsRecommendationRepo,
  type ScholarsRecommendation,
} from './scholars-recommendation.repo';

/**
 * Default number of ordered semantic batches returned by one Scholars request.
 * API callers may choose a smaller or larger bounded page size explicitly.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the exported constant is documented in the block above.
export const ScholarsRecommendationPageSize = 20;

/** Ordered recommendation references and opaque continuation state for one page. */
export type ScholarsRecommendationPage = {
  recommendations: ScholarsRecommendation[];
  nextCursor?: string;
  exhausted: boolean;
};

const SequenceCursorSchema = z.strictObject({ after: z.string().min(1) });
type SequenceCursor = z.infer<typeof SequenceCursorSchema>;

/** Encodes the last semantic batch emitted by the current Scholars page. */
function encodeSequenceCursor(after: string): string {
  return Buffer.from(JSON.stringify({ after }), 'utf8').toString('base64url');
}

/** Rejects malformed continuation rather than treating it as a first page. */
function decodeSequenceCursor(cursor?: string): SequenceCursor | undefined {
  if (!cursor) return undefined;

  try {
    return SequenceCursorSchema.parse(
      JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')),
    );
  } catch {
    throw new BadRequestException('The Scholars recommendation cursor is invalid');
  }
}

function deduplicateReferences(recommendation: ScholarsRecommendation): ScholarsRecommendation {
  return { ...recommendation, itemIds: [...new Set(recommendation.itemIds)] };
}

@Injectable()
/** Runs the deterministic strategy for the root Scholars page feed. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarsRecommendationEngine {
  constructor(private readonly repo: ScholarsRecommendationRepo) {}

  /**
   * Returns one ordered recommendation sequence page.
   *
   * The cursor identifies the last emitted semantic batch and is opaque to API
   * clients. The sequence is re-planned from current Catalog state, so a batch
   * inserted before the anchor does not repeat an already emitted batch. A
   * missing anchor produces an exhausted empty page rather than restarting.
   * Repeated entity references are removed within each semantic batch while
   * the same entity may remain visible in a different batch context.
   */
  async recommend(
    cursor?: string,
    limit = ScholarsRecommendationPageSize,
  ): Promise<ScholarsRecommendationPage> {
    const sequenceCursor = decodeSequenceCursor(cursor);
    const recommendations = (await this.repo.getRecommendations()).map(deduplicateReferences);
    const start = sequenceCursor
      ? recommendations.findIndex((recommendation) => recommendation.id === sequenceCursor.after) +
        1
      : 0;
    if (sequenceCursor && start === 0) {
      return { recommendations: [], nextCursor: undefined, exhausted: true };
    }

    const page = recommendations.slice(start, start + limit);
    const exhausted = start + page.length >= recommendations.length;

    return {
      recommendations: page,
      nextCursor: exhausted ? undefined : encodeSequenceCursor(page.at(-1)!.id),
      exhausted,
    };
  }
}
