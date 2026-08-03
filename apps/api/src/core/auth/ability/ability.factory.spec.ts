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
          { target: 'listing', capability: 'write', scholarId: 'a', locale: null },
          { target: 'listing', capability: 'write', scholarId: 'b', locale: null },
        ],
      }),
    );

    expect(ability.can('write', subject('Listing', { scholarId: 'a' }))).toBe(true);
    expect(ability.can('write', subject('Listing', { scholarId: 'b' }))).toBe(true);
    expect(ability.can('write', subject('Listing', { scholarId: 'c' }))).toBe(false);
    expect(ability.can('delete', subject('Listing', { scholarId: 'a' }))).toBe(false);
  });

  it('supports translation scope by scholar and locale', () => {
    const ability = defineAbilityFor(
      baseInput({
        accessGrants: [
          { target: 'translation', capability: 'translate', scholarId: 'a', locale: 'ar' },
        ],
      }),
    );

    expect(ability.can('translate', subject('Translation', { scholarId: 'a', locale: 'ar' }))).toBe(
      true,
    );
    expect(ability.can('translate', subject('Translation', { scholarId: 'a', locale: 'en' }))).toBe(
      false,
    );
    expect(ability.can('translate', subject('Translation', { scholarId: 'b', locale: 'ar' }))).toBe(
      false,
    );
  });

  it('supports global user management without granting editorial capabilities', () => {
    const ability = defineAbilityFor(
      baseInput({
        accessGrants: [{ target: 'user', capability: 'manage', scholarId: null, locale: null }],
      }),
    );

    expect(ability.can('manage', 'UserAccess')).toBe(true);
    expect(ability.can('write', 'Listing')).toBe(false);
  });
});
