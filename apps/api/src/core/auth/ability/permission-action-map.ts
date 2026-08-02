import type { Permission } from '@sd/core-contracts';
import type { AppActions, AppSubjectType } from './ability.types';

export type PermissionActionMapping = {
  action: AppActions | AppActions[];
  subject: AppSubjectType | AppSubjectType[];
};

/**
 * Maps each flat Permission grant to the CASL {action, subject} it satisfies.
 * LISTINGS_PUBLISH maps to both 'publish' and 'archive' to preserve the
 * existing controller's conflation of the two under one permission.
 */
export const PERMISSION_ACTION_MAP: Record<Permission, PermissionActionMapping> = {
  SCHOLARS_VIEW: { action: 'read', subject: 'Scholar' },
  SCHOLARS_CREATE: { action: 'create', subject: 'Scholar' },
  SCHOLARS_EDIT: { action: 'update', subject: 'Scholar' },
  SCHOLARS_DELETE: { action: 'delete', subject: 'Scholar' },
  SCHOLARS_PUBLISH: { action: 'publish', subject: 'Scholar' },

  LISTINGS_VIEW: { action: 'read', subject: 'Listing' },
  LISTINGS_CREATE: { action: 'create', subject: 'Listing' },
  LISTINGS_EDIT: { action: 'update', subject: 'Listing' },
  LISTINGS_DELETE: { action: 'delete', subject: 'Listing' },
  LISTINGS_PUBLISH: { action: ['publish', 'archive'], subject: 'Listing' },

  TOPICS_VIEW: { action: 'read', subject: 'Topic' },
  TOPICS_CREATE: { action: 'create', subject: 'Topic' },
  TOPICS_EDIT: { action: 'update', subject: 'Topic' },
  TOPICS_DELETE: { action: 'delete', subject: 'Topic' },
  TOPICS_PUBLISH: { action: 'publish', subject: 'Topic' },

  TRANSLATIONS_VIEW: { action: 'read', subject: 'Translation' },
  TRANSLATIONS_CREATE: { action: 'create', subject: 'Translation' },
  TRANSLATIONS_EDIT: { action: 'update', subject: 'Translation' },
  TRANSLATIONS_DELETE: { action: 'delete', subject: 'Translation' },
  TRANSLATIONS_PUBLISH: { action: 'publish', subject: 'Translation' },

  MEDIA_UPLOAD: { action: 'upload', subject: 'Media' },
  MEDIA_DELETE: { action: 'delete', subject: 'Media' },

  USERS_VIEW: { action: 'read', subject: 'User' },
  USERS_EDIT: { action: 'update', subject: 'User' },
  USERS_DELETE: { action: 'delete', subject: 'User' },
  USERS_GRANT_PERMISSIONS: { action: 'grant', subject: 'UserPermission' },
  // Also grants scholar/translator scoped-role management (Stage 3's new
  // grant endpoints) — granting roles and granting scoped access are the
  // same admin capability in this taxonomy.
  USERS_GRANT_ROLES: {
    action: 'grant',
    subject: ['UserRoleAssignment', 'UserScholarRole', 'UserTranslatorRole'],
  },
};
