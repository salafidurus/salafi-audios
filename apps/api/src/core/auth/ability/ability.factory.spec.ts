import { describe, expect, it } from 'bun:test';
import { subject } from '@casl/ability';

import { defineAbilityFor } from './ability.factory';
import type { AbilityInput } from './ability.types';

function baseInput(overrides: Partial<AbilityInput> = {}): AbilityInput {
  return {
    roles: [],
    accessGrants: [],
    ...overrides,
  };
}

describe('defineAbilityFor aggregate access', () => {
  it('gives superadmin unrestricted access', () => {
    const ability = defineAbilityFor(baseInput({ roles: ['superadmin'] }));

    expect(ability.can('manage', 'all')).toBe(true);
  });

  it('supports a write grant across multiple scholars without leaking scope', () => {
    const ability = defineAbilityFor(
      baseInput({
        accessGrants: [
          { target: 'listing', capability: 'write', scholarSlug: 'a', locale: null },
          { target: 'listing', capability: 'write', scholarSlug: 'b', locale: null },
        ],
      }),
    );

    expect(ability.can('write', subject('Listing', { scholarSlug: 'a' } as never))).toBe(true);
    expect(ability.can('create', subject('Listing', { scholarSlug: 'a' } as never))).toBe(true);
    expect(ability.can('update', subject('Listing', { scholarSlug: 'a' } as never))).toBe(true);
    expect(ability.can('write', subject('Listing', { scholarSlug: 'b' } as never))).toBe(true);
    expect(ability.can('write', subject('Listing', { scholarSlug: 'c' } as never))).toBe(false);
    expect(ability.can('delete', subject('Listing', { scholarSlug: 'a' } as never))).toBe(false);
  });

  it('maps media write access to upload without granting delete', () => {
    const ability = defineAbilityFor(
      baseInput({
        accessGrants: [{ target: 'media', capability: 'write', scholarSlug: 'a', locale: null }],
      }),
    );

    expect(ability.can('upload', subject('Media', { scholarSlug: 'a' } as never))).toBe(true);
    expect(ability.can('delete', subject('Media', { scholarSlug: 'a' } as never))).toBe(false);
  });

  it('supports translation scope by scholar and locale', () => {
    const ability = defineAbilityFor(
      baseInput({
        accessGrants: [
          { target: 'translation', capability: 'translate', scholarSlug: 'a', locale: 'ar' },
        ],
      }),
    );

    expect(
      ability.can('translate', subject('Translation', { scholarSlug: 'a', locale: 'ar' } as never)),
    ).toBe(true);
    expect(
      ability.can('translate', subject('Translation', { scholarSlug: 'a', locale: 'en' } as never)),
    ).toBe(false);
    expect(
      ability.can('translate', subject('Translation', { scholarSlug: 'b', locale: 'ar' } as never)),
    ).toBe(false);
  });

  it('supports global user management without granting editorial capabilities', () => {
    const ability = defineAbilityFor(
      baseInput({
        accessGrants: [{ target: 'user', capability: 'manage', scholarSlug: null, locale: null }],
      }),
    );

    expect(ability.can('manage', 'UserAccess')).toBe(true);
    expect(ability.can('write', 'Listing')).toBe(false);
  });
});
