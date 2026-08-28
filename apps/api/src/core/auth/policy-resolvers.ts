import { LocaleSchema, type Locale } from '@sd/core-contracts';
import { z } from 'zod';
import type {
  PolicyRequestContext,
  PolicyResource,
  PolicyResourceResolver,
} from './decorators/check-policy.decorator';

/** Core API policy resolvers module providing shared backend infrastructure and authority-boundary services. */
const localeBodySchema = z.looseObject({ locale: LocaleSchema.optional() });

function readOptionalStringField(ctx: PolicyRequestContext, field: string): string | undefined {
  const parsed = z.looseObject({ [field]: z.string().optional() }).safeParse(ctx.body);
  if (!parsed.success) return undefined;
  return parsed.data[field];
}

function readOptionalBodyLocale(ctx: PolicyRequestContext) {
  const parsed = localeBodySchema.safeParse(ctx.body);
  if (!parsed.success) return undefined;
  return parsed.data.locale;
}

function readOptionalLocaleValue(value: string | undefined): Locale | undefined {
  if (value === undefined) return undefined;
  const parsed = LocaleSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function withOptionalLocale(
  resource: Omit<PolicyResource, 'locale'>,
  locale?: Locale,
): PolicyResource {
  return locale ? { ...resource, locale } : resource;
}

/**
 * Shared @CheckPolicy resolvers. A resolver's only job is to produce the
 * resource conditions (e.g. { scholarSlug }) checked against the caller's
 * ability — existence/404 handling stays the service's responsibility.
 */

/**
 * Resolves only the locale for resources without a Scholar owner (currently
 * topic translations). Scholar-scoped grants cannot match this resource,
 * while a global translation grant can still be limited to its locale.
 */
export const resolveUnscoped: PolicyResourceResolver = (ctx) => {
  const locale = readOptionalLocaleValue(ctx.params.locale) ?? readOptionalBodyLocale(ctx);
  return locale ? { locale } : {};
};

/** Scholar routes use the public slug as the resource identity. */
/** Legacy admin routes still expose an internal id until their route contract migrates. */
export const resolveScholarIdParam =
  (paramName = 'id'): PolicyResourceResolver =>
  async (ctx, prisma) => {
    const scholar = await prisma.scholar.findUnique({
      where: { id: ctx.params[paramName] },
      select: { slug: true },
    });
    return { slug: scholar?.slug };
  };

/** Listing routes: fetch the listing's owning public scholar slug. */
/** Legacy admin routes still expose an internal id until their route contract migrates. */
export const resolveListingScholarId =
  (paramName = 'id'): PolicyResourceResolver =>
  async (ctx, prisma) => {
    const listing = await prisma.listing.findUnique({
      where: { id: ctx.params[paramName] },
      select: { scholar: { select: { slug: true } } },
    });
    return { scholarSlug: listing?.scholar?.slug };
  };

/** Listing creation: the target scholar comes from the request body. */
export const resolveScholarFromBody =
  (field = 'scholarId'): PolicyResourceResolver =>
  (ctx) => ({ scholarSlug: readOptionalStringField(ctx, field) });

/** @deprecated Use resolveScholarFromBody; retained while DTO call sites migrate. */
export const resolveScholarIdFromBody = resolveScholarFromBody;

/**
 * Scholar-owned translation sub-resource routes (e.g. /scholars/:slug/translations)
 * where the route param is the scholar slug. `locale` is
 * only included in the checked condition when the route has one (list
 * routes don't target a single locale).
 */
export const resolveScholarTranslation =
  (paramName = 'slug'): PolicyResourceResolver =>
  (ctx) => {
    const locale = readOptionalLocaleValue(ctx.params.locale) ?? readOptionalBodyLocale(ctx);
    const scholarSlug = ctx.params[paramName];
    return withOptionalLocale({ scholarSlug }, locale);
  };

/**
 * Listing-owned translation sub-resource routes (e.g. /listings/:slug/translations)
 * where the route param is the listing slug — fetch its owning scholar slug.
 */
export const resolveListingTranslation =
  (paramName = 'slug'): PolicyResourceResolver =>
  async (ctx, prisma) => {
    const listing = await prisma.listing.findFirst({
      where: { slug: ctx.params[paramName] },
      select: { scholar: { select: { slug: true } } },
    });
    const locale = readOptionalLocaleValue(ctx.params.locale) ?? readOptionalBodyLocale(ctx);
    return withOptionalLocale({ scholarSlug: listing?.scholar?.slug }, locale);
  };
