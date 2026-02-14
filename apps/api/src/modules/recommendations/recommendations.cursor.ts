export type RecommendationCursor = {
  offset: number;
};

export function encodeCursor(cur: RecommendationCursor): string {
  return Buffer.from(JSON.stringify(cur), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): RecommendationCursor | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as Partial<RecommendationCursor>;
    if (
      !parsed ||
      typeof parsed.offset !== 'number' ||
      Number.isNaN(parsed.offset)
    ) {
      return null;
    }
    return { offset: parsed.offset };
  } catch {
    return null;
  }
}
