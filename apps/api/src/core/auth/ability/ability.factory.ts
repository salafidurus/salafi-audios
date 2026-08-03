import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { PERMISSION_ACTION_MAP } from './permission-action-map';
import type { AbilityInput, AppAbility } from './ability.types';

export function defineAbilityFor(user: AbilityInput): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user.roles.includes('superadmin')) {
    can('manage', 'all');
    return build();
  }

  for (const grant of user.accessGrants ?? []) {
    const conditions: Record<string, string> = {};
    if (grant.scholarId) conditions.scholarId = grant.scholarId;
    if (grant.locale) conditions.locale = grant.locale;
    if (grant.target === 'scholar' && grant.scholarId) conditions.id = grant.scholarId;

    const subject =
      grant.target === 'user'
        ? 'UserAccess'
        : `${grant.target.charAt(0).toUpperCase()}${grant.target.slice(1)}`;
    can(
      grant.capability as never,
      subject as never,
      Object.keys(conditions).length ? (conditions as never) : undefined,
    );
  }

  for (const permission of user.permissions) {
    const mapping = PERMISSION_ACTION_MAP[permission as keyof typeof PERMISSION_ACTION_MAP];
    if (!mapping) continue;
    can(mapping.action, mapping.subject);
  }

  for (const link of user.scholarLinks) {
    const condition = { scholarId: link.scholarId };
    can(['read', 'update'], 'Scholar', { id: link.scholarId });
    can(['read', 'update'], 'Listing', condition);
    can(['read', 'create'], 'Translation', condition);

    if (link.permissionType === 'OWN_CONTENT') {
      can(['create', 'publish', 'archive'], 'Listing', condition);
      can('upload', 'Media', condition);
    }
  }

  for (const role of user.translatorRoles) {
    if (role.scholarId == null) {
      can(['read', 'create', 'update'], 'Translation', { locale: role.locale });
      if (role.canPublish) can('publish', 'Translation', { locale: role.locale });
    } else {
      can(['read', 'create', 'update'], 'Translation', {
        scholarId: role.scholarId,
        locale: role.locale,
      });
      if (role.canPublish) {
        can('publish', 'Translation', { scholarId: role.scholarId, locale: role.locale });
      }
    }
  }

  return build();
}
