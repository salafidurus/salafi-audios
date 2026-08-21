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
    if (grant.scholarSlug) conditions.scholarSlug = grant.scholarSlug;
    if (grant.locale) conditions.locale = grant.locale;
    if (grant.target === 'scholar' && grant.scholarSlug) conditions.slug = grant.scholarSlug;

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
      // SAFETY: the action/subject/conditions are all derived from the shared
      // access-grant vocabulary, but CASL's builder signature is not specific
      // enough to carry those narrowed unions through this dynamic mapping.
      can(
        action as never,
        subject as never,
        Object.keys(conditions).length ? (conditions as never) : undefined,
      );
    }
  }

  return build();
}
