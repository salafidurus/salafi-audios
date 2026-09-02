import { describe, expect, it } from 'bun:test';

import { canAccess } from './policy';
import type { AbilityInput } from './ability/ability.types';

function baseInput(overrides: Partial<AbilityInput> = {}): AbilityInput {
  return { roles: [], accessGrants: [], ...overrides };
}

describe('canAccess', () => {
  it('allows a global grant for an otherwise unscoped resource', () => {
    expect(
      canAccess(
        baseInput({
          accessGrants: [
            { target: 'listing', capability: 'write', scholarSlug: null, locale: null },
          ],
        }),
        {
          action: 'update',
          subjectType: 'Listing',
          resource: { scholarSlug: 'scholar-a' },
        },
      ),
    ).toBe(true);
  });

  it('requires the normalized scholar scope for a scoped listing grant', () => {
    const input = baseInput({
      accessGrants: [
        { target: 'listing', capability: 'write', scholarSlug: 'scholar-a', locale: null },
      ],
    });

    expect(
      canAccess(input, {
        action: 'update',
        subjectType: 'Listing',
        resource: { scholarSlug: 'scholar-a' },
      }),
    ).toBe(true);
    expect(
      canAccess(input, {
        action: 'update',
        subjectType: 'Listing',
        resource: { scholarSlug: 'scholar-b' },
      }),
    ).toBe(false);
    expect(canAccess(input, { action: 'update', subjectType: 'Listing' })).toBe(false);
  });

  it('checks scholar, locale, and user scopes without widening them', () => {
    const input = baseInput({
      accessGrants: [
        { target: 'scholar', capability: 'write', scholarSlug: 'scholar-a', locale: null },
        { target: 'translation', capability: 'translate', scholarSlug: 'scholar-a', locale: 'ar' },
        { target: 'user', capability: 'manage', scholarSlug: null, locale: null },
      ],
    });

    expect(
      canAccess(input, {
        action: 'update',
        subjectType: 'Scholar',
        resource: { slug: 'scholar-a' },
      }),
    ).toBe(true);
    expect(
      canAccess(input, {
        action: 'update',
        subjectType: 'Scholar',
        resource: { slug: 'scholar-b' },
      }),
    ).toBe(false);
    expect(
      canAccess(input, {
        action: 'translate',
        subjectType: 'Translation',
        resource: { scholarSlug: 'scholar-a', locale: 'ar' },
      }),
    ).toBe(true);
    expect(
      canAccess(input, {
        action: 'translate',
        subjectType: 'Translation',
        resource: { scholarSlug: 'scholar-a', locale: 'en' },
      }),
    ).toBe(false);
    expect(canAccess(input, { action: 'manage', subjectType: 'UserAccess' })).toBe(true);
  });

  it('denies unresolved resources even when a global grant exists', () => {
    const input = baseInput({
      accessGrants: [{ target: 'listing', capability: 'write', scholarSlug: null, locale: null }],
    });

    expect(
      canAccess(input, {
        action: 'update',
        subjectType: 'Listing',
        resource: { scholarSlug: undefined },
        resourceResolved: true,
      }),
    ).toBe(false);
  });

  it('allows the superadmin role to bypass resource policy', () => {
    expect(
      canAccess(baseInput({ roles: ['superadmin'] }), {
        action: 'delete',
        subjectType: 'Scholar',
        resource: { slug: 'scholar-a' },
        resourceResolved: true,
      }),
    ).toBe(true);
  });
});
