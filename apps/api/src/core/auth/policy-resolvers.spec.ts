import { describe, expect, it } from 'bun:test';
import {
  resolveListingTranslation,
  resolveScholarTranslation,
  resolveUnscoped,
} from './policy-resolvers';

describe('slug-based policy resolvers', () => {
  it('uses only the scholar slug for scholar translations', async () => {
    const resource = await resolveScholarTranslation()(
      { params: { slug: 'sheikh-example', locale: 'en' }, body: {}, query: {} },
      {} as never,
    );

    expect(resource).toEqual({ scholarSlug: 'sheikh-example', locale: 'en' });
    expect(resource).not.toHaveProperty('scholarId');
  });

  it('resolves a listing slug to its owning scholar slug', async () => {
    const resource = await resolveListingTranslation()(
      { params: { slug: 'lecture-example', locale: 'en' }, body: {}, query: {} },
      {
        listing: {
          findFirst: async () => ({ scholar: { slug: 'sheikh-example' } }),
        },
      } as never,
    );

    expect(resource).toEqual({ scholarSlug: 'sheikh-example', locale: 'en' });
    expect(resource).not.toHaveProperty('scholarId');
  });

  it('includes the body locale for listing translation creation', async () => {
    const resource = await resolveListingTranslation()(
      { params: { slug: 'lecture-example' }, body: { locale: 'en' }, query: {} },
      {
        listing: {
          findFirst: async () => ({ scholar: { slug: 'sheikh-example' } }),
        },
      } as never,
    );

    expect(resource).toEqual({ scholarSlug: 'sheikh-example', locale: 'en' });
  });

  it('keeps topic translation checks locale-scoped without inventing a scholar scope', async () => {
    const resource = await resolveUnscoped(
      { params: { locale: 'ar' }, body: {}, query: {} },
      {} as never,
    );

    expect(resource).toEqual({ locale: 'ar' });
  });
});
