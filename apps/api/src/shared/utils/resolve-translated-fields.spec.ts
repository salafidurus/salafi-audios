import { resolveTranslatedFields } from './resolve-translated-fields';

describe('resolveTranslatedFields', () => {
  const primary: Record<string, string | null> = {
    title: 'Hello',
    description: null,
  };

  it('returns primary fields when translation is null', () => {
    expect(resolveTranslatedFields(primary, null)).toEqual(primary);
  });

  it('returns translated fields when translation is present', () => {
    expect(
      resolveTranslatedFields(primary, { title: 'مرحبا', description: 'وصف' }),
    ).toEqual({
      title: 'مرحبا',
      description: 'وصف',
    });
  });

  it('falls back to primary for fields missing from translation', () => {
    expect(resolveTranslatedFields(primary, { title: 'مرحبا' })).toEqual({
      title: 'مرحبا',
      description: null,
    });
  });
});
