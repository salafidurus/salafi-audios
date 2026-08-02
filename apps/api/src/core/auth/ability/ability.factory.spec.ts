import { describe, it, expect } from 'bun:test';
import { subject } from '@casl/ability';
import { defineAbilityFor } from './ability.factory';
import { PERMISSION_ACTION_MAP } from './permission-action-map';
import type { AbilityInput } from './ability.types';

function baseInput(overrides: Partial<AbilityInput> = {}): AbilityInput {
  return {
    roles: [],
    permissions: [],
    scholarLinks: [],
    translatorRoles: [],
    ...overrides,
  };
}

describe('defineAbilityFor', () => {
  describe('superadmin bypass', () => {
    it('grants manage all to a superadmin regardless of permissions', () => {
      const ability = defineAbilityFor(baseInput({ roles: ['superadmin'] }));
      expect(ability.can('manage', 'all')).toBe(true);
      expect(ability.can('delete', subject('Scholar', { id: 'anything' }))).toBe(true);
      expect(ability.can('publish', subject('Translation', { locale: 'ar' }))).toBe(true);
    });

    it('does not grant manage all to a non-superadmin', () => {
      const ability = defineAbilityFor(baseInput({ roles: ['admin'] }));
      expect(ability.can('manage', 'all')).toBe(false);
    });
  });

  describe('global permission → action/subject mapping', () => {
    for (const [permission, mapping] of Object.entries(PERMISSION_ACTION_MAP)) {
      const actions = Array.isArray(mapping.action) ? mapping.action : [mapping.action];
      const subjects = Array.isArray(mapping.subject) ? mapping.subject : [mapping.subject];
      for (const action of actions) {
        for (const subjectType of subjects) {
          it(`${permission} grants unconditioned ${action} on ${subjectType}`, () => {
            const ability = defineAbilityFor(baseInput({ permissions: [permission] }));
            expect(ability.can(action, subjectType)).toBe(true);
            // Unconditioned means it must also match any instance of that subject.
            expect(ability.can(action, subject(subjectType, { id: 'x', scholarId: 'x' }))).toBe(
              true,
            );
          });
        }
      }
    }

    it('does not grant actions for permissions the user was not given', () => {
      const ability = defineAbilityFor(baseInput({ permissions: ['SCHOLARS_VIEW'] }));
      expect(ability.can('update', 'Scholar')).toBe(false);
      expect(ability.can('read', 'Listing')).toBe(false);
    });
  });

  describe('scholarLinks scoping', () => {
    it('OWN_CONTENT grants full content rights scoped to that scholar only', () => {
      const ability = defineAbilityFor(
        baseInput({
          scholarLinks: [{ scholarId: 'scholar-a', permissionType: 'OWN_CONTENT' }],
        }),
      );

      expect(ability.can('update', subject('Scholar', { id: 'scholar-a' }))).toBe(true);
      expect(ability.can('update', subject('Scholar', { id: 'scholar-b' }))).toBe(false);

      expect(ability.can('read', subject('Listing', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('create', subject('Listing', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('update', subject('Listing', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('publish', subject('Listing', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('archive', subject('Listing', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('update', subject('Listing', { scholarId: 'scholar-b' }))).toBe(false);

      expect(ability.can('upload', subject('Media', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('upload', subject('Media', { scholarId: 'scholar-b' }))).toBe(false);

      expect(ability.can('create', 'Scholar')).toBe(false);
    });

    it('ASSIGNED_EDITOR grants edit-only rights, no create/publish/archive', () => {
      const ability = defineAbilityFor(
        baseInput({
          scholarLinks: [{ scholarId: 'scholar-a', permissionType: 'ASSIGNED_EDITOR' }],
        }),
      );

      expect(ability.can('update', subject('Listing', { scholarId: 'scholar-a' }))).toBe(true);
      expect(ability.can('create', subject('Listing', { scholarId: 'scholar-a' }))).toBe(false);
      expect(ability.can('publish', subject('Listing', { scholarId: 'scholar-a' }))).toBe(false);
      expect(ability.can('archive', subject('Listing', { scholarId: 'scholar-a' }))).toBe(false);
    });
  });

  describe('translatorRoles scoping (two-axis: content scope × locale scope)', () => {
    it('all-scholars (scholarId: null) grants a locale-only rule matching any scholar-owned translation', () => {
      const ability = defineAbilityFor(
        baseInput({
          translatorRoles: [{ scholarId: null, locale: 'ar', canPublish: false }],
        }),
      );

      expect(
        ability.can('update', subject('Translation', { scholarId: 'scholar-a', locale: 'ar' })),
      ).toBe(true);
      expect(
        ability.can('update', subject('Translation', { scholarId: 'scholar-b', locale: 'ar' })),
      ).toBe(true);
      expect(ability.can('update', subject('Translation', { locale: 'ar' }))).toBe(true); // topic translation, no scholarId
      expect(ability.can('update', subject('Translation', { locale: 'en' }))).toBe(false);
      expect(ability.can('publish', subject('Translation', { locale: 'ar' }))).toBe(false); // canPublish: false
    });

    it('canPublish grants the publish action under the same condition', () => {
      const ability = defineAbilityFor(
        baseInput({
          translatorRoles: [{ scholarId: null, locale: 'ar', canPublish: true }],
        }),
      );
      expect(ability.can('publish', subject('Translation', { locale: 'ar' }))).toBe(true);
      expect(ability.can('publish', subject('Translation', { locale: 'en' }))).toBe(false);
    });

    it('scholar-scoped translator grant excludes other scholars and topic translations', () => {
      const ability = defineAbilityFor(
        baseInput({
          translatorRoles: [{ scholarId: 'scholar-a', locale: 'ar', canPublish: true }],
        }),
      );

      expect(
        ability.can('update', subject('Translation', { scholarId: 'scholar-a', locale: 'ar' })),
      ).toBe(true);
      expect(
        ability.can('publish', subject('Translation', { scholarId: 'scholar-a', locale: 'ar' })),
      ).toBe(true);
      // Different scholar, same locale → denied.
      expect(
        ability.can('update', subject('Translation', { scholarId: 'scholar-b', locale: 'ar' })),
      ).toBe(false);
      // Topic translation has no scholarId at all → denied.
      expect(ability.can('update', subject('Translation', { locale: 'ar' }))).toBe(false);
      // Same scholar, different locale → denied.
      expect(
        ability.can('update', subject('Translation', { scholarId: 'scholar-a', locale: 'en' })),
      ).toBe(false);
    });

    it('supports multiple locale grants for the same scholar scope (locale set)', () => {
      const ability = defineAbilityFor(
        baseInput({
          translatorRoles: [
            { scholarId: null, locale: 'en', canPublish: true },
            { scholarId: null, locale: 'ar', canPublish: false },
          ],
        }),
      );
      expect(ability.can('publish', subject('Translation', { locale: 'en' }))).toBe(true);
      expect(ability.can('update', subject('Translation', { locale: 'ar' }))).toBe(true);
      expect(ability.can('publish', subject('Translation', { locale: 'ar' }))).toBe(false);
    });
  });
});
