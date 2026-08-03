import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { AbilityInput, AppAbility, AppActions } from './ability.types';

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
    const actions: AppActions[] =
      grant.capability === 'write'
        ? grant.target === 'media'
          ? ['write', 'upload']
          : ['write', 'create', 'update']
        : [grant.capability];

    for (const action of actions) {
      can(
        action as never,
        subject as never,
        Object.keys(conditions).length ? (conditions as never) : undefined,
      );
    }
  }

  return build();
}
