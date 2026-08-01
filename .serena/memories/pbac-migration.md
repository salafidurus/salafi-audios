# PBAC Migration - Permission-Based Access Control

## Overview

Comprehensive migration from role-based access control (RBAC) to permission-based access control (PBAC) with role presets, multi-role support, and sophisticated scoping.

## Current Implementation Status

### Phase 1 ✅ COMPLETE

- [x] Prisma schema updated with new enums and models
  - `UserRoleAssignment` table (multi-role support)
  - `UserPermission` table (replacing AdminPermission)
  - `UserScholarRole` updated with permissionType
  - `UserTranslatorRole` table (language-scoped translations)
  - New enums: `Permission`, `ScholarPermissionType`
- [x] Prisma migration SQL created with data transformation

### Phase 2 ✅ COMPLETE

- [x] Permission types and constants in `@sd/core-contracts`
  - `Permission` enum (44 granular permissions)
  - `UserRole` enum (listener, scholar, translator, editor, admin, superadmin)
  - `ROLE_DEFAULT_PERMISSIONS` mapping
  - All necessary DTOs and schemas
- [x] `PermissionGuard` implementation
  - Superadmin bypass
  - Permission checking from UserPermission table
  - Scholar scoping support (via UserScholarRole)
  - Language scoping support (via UserTranslatorRole)
  - Uses Fastify types for consistency
- [x] `PermissionsService` implementation
  - Role grant/revoke with auto-permission assignment
  - Permission grant/revoke
  - Scholar linking with scoped permission auto-grant
  - Translator language assignment with language-scoped permissions
  - Helper methods for permission/role checking
  - Scoped access validation (scholars, languages)
- [x] Updated `RequiresPermission` decorator to use `Permission` enum
- [x] Registered `PermissionGuard` and `PermissionsService` in app.module.ts

### Phase 3 🟡 PENDING

- Controllers that need updating with new @RequiresPermission decorators:
  - AdminScholarsController
  - AdminListingsController
  - AdminTopicsController
  - ScholarsTranslationsController
  - ListingsTranslationsController
  - TopicsTranslationsController
  - MediaController
  - AdminUsersController / AdminPermissionsController

### Phase 4 🟡 PENDING

- Admin UI components for permission management
- API endpoints for role/permission assignment

### Phase 5 🟡 PENDING

- Create `@sd/domain-permissions` package
- useHasPermission and useHasAnyPermission hooks
- PermissionGate component
- Update navigation with permission checks

## Architecture Decisions

### Permission Naming

- Enum values use UPPER_SNAKE_CASE (e.g., `SCHOLARS_EDIT`, `LISTINGS_CREATE`)
- Organized by entity: SCHOLARS*\*, LISTINGS*\_, TOPICS\__, TRANSLATIONS\*\*, MEDIA*_, USERS\_\_, LIVE\_\*
- Follows action pattern: VIEW, CREATE, EDIT, DELETE, PUBLISH

### Role to Permission Mapping

- Roles have automatic default permissions defined in `ROLE_DEFAULT_PERMISSIONS`
- Auto-granted when role is assigned via `PermissionsService.grantRoleToUser()`
- Schema supports individual permission revocation if needed

### Scoped Access

- _Scholars_: Users with `LISTINGS_EDIT` + `UserScholarRole(permissionType=ASSIGNED_EDITOR)` can only edit assigned scholars
- _Translations_: Users with translator role limited to `UserTranslatorRole` assigned languages
- _Own Content_: Scholar linked via `UserScholarRole(permissionType=OWN_CONTENT)` auto-grants editing permissions

## Key Files

### Schema & Migrations

- `packages/core-db/prisma/schema.prisma`
- `packages/core-db/prisma/migrations/20260710075711_auto_20260710_075702/migration.sql`

### Shared Types & Constants

- `packages/core-contracts/src/types/permissions.types.ts`

### Backend Guards & Services

- `apps/api/src/shared/guards/permission.guard.ts`
- `apps/api/src/shared/services/permissions.service.ts`
- `apps/api/src/shared/decorators/requires-permission.decorator.ts`

## Next Implementation Tasks

1. **Phase 3**: Update all controller decorators
2. **Phase 4**: Admin permission management endpoints
3. **Phase 5**: Frontend permission infrastructure
4. **Testing**: Unit tests for services, integration tests for guards
5. **Verification**: Ensure all old `@RequiresPermission('string')` removed
