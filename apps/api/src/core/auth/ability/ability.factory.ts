import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { AbilityInput, AppAbility, AppActions } from './ability.types';

export function defineAbilityFor(user: AbilityInput): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user.roles.includes('superadmin')) {
    can('manage', 'all');
    return build();
  }

  for (const grant of user.accessGrants ?? []) {
    for (const action of grantActions(grant)) {
      // SAFETY: the action/subject/conditions are all derived from the shared
      // access-grant vocabulary, but CASL's builder signature is not specific
      // enough to carry those narrowed unions through this dynamic mapping.
      can(action as never, grantSubject(grant) as never, grantConditions(grant) as never);
    }
  }

  return build();
}

function grantConditions(grant: NonNullable<AbilityInput['accessGrants']>[number]) {
  const conditions: Record<string, string> = {};
  if (grant.scholarSlug) {
    conditions[grant.target === 'scholar' ? 'slug' : 'scholarSlug'] = grant.scholarSlug;
  }
  if (grant.locale) conditions.locale = grant.locale;
  return Object.keys(conditions).length ? conditions : undefined;
}

function grantSubject(grant: NonNullable<AbilityInput['accessGrants']>[number]) {
  return grant.target === 'user'
    ? 'UserAccess'
    : `${grant.target.charAt(0).toUpperCase()}${grant.target.slice(1)}`;
}

function grantActions(grant: NonNullable<AbilityInput['accessGrants']>[number]): AppActions[] {
  if (grant.capability !== 'write') return [grant.capability];
  return grant.target === 'media' ? ['write', 'upload'] : ['write', 'create', 'update'];
}
