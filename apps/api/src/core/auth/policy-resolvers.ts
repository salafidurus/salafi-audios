import type { PolicyResourceResolver } from './decorators/check-policy.decorator';

/**
 * Shared @CheckPolicy resolvers. A resolver's only job is to produce the
 * resource conditions (e.g. { scholarId }) checked against the caller's
 * ability — existence/404 handling stays the service's responsibility.
 */

/**
 * Forces a truly-unconditioned check for subjects that CAN have conditioned
 * rules elsewhere (Translation, via scholarLinks/translatorRoles) but must
 * stay global-only on this route (e.g. topic translations aren't scholar-
 * owned). Without this, a bare subjectType check (no resolver at all) would
 * match ANY rule for that action+subject regardless of its conditions —
 * CASL only evaluates conditions when an instance is provided — letting a
 * scholar/locale-scoped grant leak into a route it shouldn't apply to.
 */
export const resolveUnscoped: PolicyResourceResolver = () => ({});

/** Scholar routes: the route param IS the resource's own id. */
export const resolveScholarIdParam =
  (paramName = 'id'): PolicyResourceResolver =>
  (ctx) => ({ id: ctx.params[paramName] });

/** Listing routes: fetch the listing's owning scholarId from its id param. */
export const resolveListingScholarId =
  (paramName = 'id'): PolicyResourceResolver =>
  async (ctx, prisma) => {
    const listing = await prisma.listing.findUnique({
      where: { id: ctx.params[paramName] },
      select: { scholarId: true },
    });
    return { scholarId: listing?.scholarId };
  };

/** Listing creation: the target scholar comes from the request body. */
export const resolveScholarIdFromBody =
  (field = 'scholarId'): PolicyResourceResolver =>
  (ctx) => ({ scholarId: (ctx.body as Record<string, unknown> | undefined)?.[field] });

/**
 * Scholar-owned translation sub-resource routes (e.g. /scholars/:id/translations)
 * where the route param IS the scholar id — no DB fetch needed. `locale` is
 * only included in the checked condition when the route has one (list
 * routes don't target a single locale).
 */
export const resolveScholarTranslation =
  (paramName = 'id'): PolicyResourceResolver =>
  (ctx) => {
    const scholarId = ctx.params[paramName];
    const bodyLocale = (ctx.body as Record<string, unknown> | undefined)?.locale;
    const locale = ctx.params.locale ?? (typeof bodyLocale === 'string' ? bodyLocale : undefined);
    return locale ? { scholarId, locale } : { scholarId };
  };

/**
 * Listing-owned translation sub-resource routes (e.g. /listings/:id/translations)
 * where the route param is the listing id — fetch its owning scholarId.
 */
export const resolveListingTranslation =
  (paramName = 'id'): PolicyResourceResolver =>
  async (ctx, prisma) => {
    const listing = await prisma.listing.findUnique({
      where: { id: ctx.params[paramName] },
      select: { scholarId: true },
    });
    return ctx.params.locale
      ? { scholarId: listing?.scholarId, locale: ctx.params.locale }
      : { scholarId: listing?.scholarId };
  };
