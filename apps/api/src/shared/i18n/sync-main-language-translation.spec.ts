import { describe, it, expect, vi } from 'bun:test';
import { syncMainLanguageTranslation } from './sync-main-language-translation';

describe('syncMainLanguageTranslation', () => {
  it('upserts only the new locale on create (no old locale/fields)', async () => {
    const upsert = vi.fn<any>().mockResolvedValue(undefined);

    await syncMainLanguageTranslation({
      upsert,
      newLocale: 'ar',
      newFields: { title: 'العنوان' },
    });

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith('ar', { title: 'العنوان' });
  });

  it('upserts only the new locale when the locale is unchanged, always overwriting', async () => {
    const upsert = vi.fn<any>().mockResolvedValue(undefined);

    await syncMainLanguageTranslation({
      upsert,
      oldLocale: 'ar',
      oldFields: { title: 'العنوان القديم' },
      newLocale: 'ar',
      newFields: { title: 'العنوان الجديد' },
    });

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith('ar', { title: 'العنوان الجديد' });
  });

  it('snapshots the old locale then upserts the new locale when the locale changes', async () => {
    const calls: Array<[string, unknown]> = [];
    const upsert = vi.fn<any>().mockImplementation(async (locale: string, fields: unknown) => {
      calls.push([locale, fields]);
    });

    await syncMainLanguageTranslation({
      upsert,
      oldLocale: 'ar',
      oldFields: { title: 'العنوان' },
      newLocale: 'en',
      newFields: { title: 'The Title' },
    });

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(calls[0]).toEqual(['ar', { title: 'العنوان' }]);
    expect(calls[1]).toEqual(['en', { title: 'The Title' }]);
  });

  it('does not attempt to snapshot the old locale when oldFields is missing', async () => {
    const upsert = vi.fn<any>().mockResolvedValue(undefined);

    await syncMainLanguageTranslation({
      upsert,
      oldLocale: 'ar',
      oldFields: null,
      newLocale: 'en',
      newFields: { title: 'The Title' },
    });

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith('en', { title: 'The Title' });
  });
});
