import { resolveContentTranslation } from './resolve-content-translation';

describe('resolveContentTranslation', () => {
  it('returns base fields and no original block when no translation exists', () => {
    const result = resolveContentTranslation({
      base: { title: 'الأصل', description: 'وصف' },
      originalLanguage: 'ar',
      targetLocale: 'en',
      publishedTranslation: null,
    });

    expect(result.fields).toEqual({ title: 'الأصل', description: 'وصف' });
    expect(result.original).toBeUndefined();
    expect(result.originalLanguage).toBe('ar');
  });

  it('applies the translation and exposes the original when target differs', () => {
    const result = resolveContentTranslation({
      base: { title: 'الأصل', description: 'وصف' },
      originalLanguage: 'ar',
      targetLocale: 'en',
      publishedTranslation: { title: 'Origin', description: 'Description' },
    });

    expect(result.fields).toEqual({
      title: 'Origin',
      description: 'Description',
    });
    expect(result.original).toEqual({ title: 'الأصل', description: 'وصف' });
    expect(result.originalLanguage).toBe('ar');
  });

  it('does not translate when the target equals the original language', () => {
    const result = resolveContentTranslation({
      base: { title: 'Origin' },
      originalLanguage: 'en',
      targetLocale: 'en',
      // A stray same-language row must never override the base.
      publishedTranslation: { title: 'Should not win' },
    });

    expect(result.fields).toEqual({ title: 'Origin' });
    expect(result.original).toBeUndefined();
  });

  it('falls back to the base for fields the translation omits', () => {
    const result = resolveContentTranslation({
      base: { title: 'الأصل', description: 'وصف' as string | null },
      originalLanguage: 'ar',
      targetLocale: 'en',
      publishedTranslation: { title: 'Origin', description: null },
    });

    expect(result.fields).toEqual({ title: 'Origin', description: 'وصف' });
    expect(result.original).toEqual({ title: 'الأصل', description: 'وصف' });
  });

  it('applies the translation even when the original language is unknown', () => {
    const result = resolveContentTranslation({
      base: { name: 'الأصل' },
      originalLanguage: null,
      targetLocale: 'en',
      publishedTranslation: { name: 'Origin' },
    });

    expect(result.fields).toEqual({ name: 'Origin' });
    expect(result.original).toEqual({ name: 'الأصل' });
    expect(result.originalLanguage).toBeUndefined();
  });
});
