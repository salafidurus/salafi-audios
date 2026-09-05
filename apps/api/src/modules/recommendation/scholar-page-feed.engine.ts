import { BadRequestException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ScholarPageFeedRepo, type ScholarPageFeedRecommendation } from './scholar-page-feed.repo';

/**
 * Default number of ordered semantic batches returned by one Scholars request.
 * API callers may choose a smaller or larger bounded page size explicitly.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the exported constant is documented in the block above.
export const ScholarPageFeedPageSize = 20;

/** Ordered recommendation references and opaque continuation state for one page. */
export type ScholarPageFeedRecommendationPage = {
  recommendations: ScholarPageFeedRecommendation[];
  nextCursor?: string;
  exhausted: boolean;
};

const SequenceCursorSchema = z.strictObject({ offset: z.number().int().nonnegative() });
type SequenceCursor = z.infer<typeof SequenceCursorSchema>;

function encodeSequenceCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset }), 'utf8').toString('base64url');
}

function decodeSequenceCursor(cursor?: string): SequenceCursor {
  if (!cursor) return { offset: 0 };

  try {
    return SequenceCursorSchema.parse(
      JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')),
    );
  } catch {
    throw new BadRequestException('The Scholars recommendation cursor is invalid');
  }
}

function deduplicateReferences(
  recommendation: ScholarPageFeedRecommendation,
): ScholarPageFeedRecommendation {
  return { ...recommendation, itemIds: [...new Set(recommendation.itemIds)] };
}

@Injectable()
/** Runs the deterministic strategy for the root Scholars page feed. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarPageFeedEngine {
  constructor(private readonly repo: ScholarPageFeedRepo) {}

  /**
   * Returns one ordered recommendation sequence page.
   *
   * The cursor encodes only an internal sequence offset and is opaque to API
   * clients. Repeated entity references are removed within each semantic batch
   * while the same entity may remain visible in a different batch context.
   */
  async recommend(
    cursor?: string,
    limit = ScholarPageFeedPageSize,
  ): Promise<ScholarPageFeedRecommendationPage> {
    const { offset } = decodeSequenceCursor(cursor);
    const recommendations = (await this.repo.getRecommendations()).map(deduplicateReferences);
    const page = recommendations.slice(offset, offset + limit);
    const nextOffset = offset + page.length;
    const exhausted = nextOffset >= recommendations.length;

    return {
      recommendations: page,
      nextCursor: exhausted ? undefined : encodeSequenceCursor(nextOffset),
      exhausted,
    };
  }
}
