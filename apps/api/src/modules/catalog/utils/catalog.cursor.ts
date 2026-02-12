export type CatalogCursor = {
  createdAt: string; // ISO
  id: string;
};

export function encodeCursor(cur: CatalogCursor): string {
  return Buffer.from(JSON.stringify(cur), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): CatalogCursor | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as Partial<CatalogCursor>;
    if (
      !parsed ||
      typeof parsed.createdAt !== 'string' ||
      typeof parsed.id !== 'string'
    )
      return null;
    return { createdAt: parsed.createdAt, id: parsed.id };
  } catch {
    return null;
  }
}
