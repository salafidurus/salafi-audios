import { PrismaService } from '../../src/core/db/prisma.service';
import { AccessCapability, AccessTarget, Permission, UserRole } from '@sd/core-db';
import { createId } from '@paralleldrive/cuid2';

export class TestAuthFactory {
  private readonly createdUserIds: Set<string> = new Set();

  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    email?: string,
    roles: UserRole[] = [UserRole.listener],
    permissions: Permission[] = [],
  ) {
    const uniqueEmail = email ?? `e2e-test-${createId()}@salafidurus.com`;
    const user = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'E2E Test User',
        email: uniqueEmail,
        role: 'user',
        emailVerified: true,
      },
    });

    this.createdUserIds.add(user.id);

    // Create role assignments
    if (roles.length > 0) {
      await this.prisma.userRoleAssignment.createMany({
        data: roles.map((role) => ({
          userId: user.id,
          role,
        })),
      });
    }

    // Create permissions
    if (permissions.length > 0) {
      await this.prisma.userPermission.createMany({
        data: permissions.map((permission) => ({
          userId: user.id,
          permission,
        })),
      });
    }

    // Insert Session directly into the DB to bypass OAuth redirects
    const token = `token-${createId()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

    const session = await this.prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user,
      session,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async createAdminUser(permissions: Permission[] = []) {
    const auth = await this.createUser(undefined, [UserRole.admin], permissions);
    const grants = permissions.flatMap((permission) => grantsForPermission(permission));
    if (grants.length > 0) {
      await this.prisma.userAccessGrant.createMany({
        data: grants.map((grant) => ({ ...grant, userId: auth.user.id })),
      });
    }
    return auth;
  }

  /**
   * Creates a listener-level user linked to a scholar (by internal id, not
   * slug — tests already have the seeded scholar's id) via UserScholarRole,
   * with no global permissions. Used to prove scholar-scoped ability rules
   * (not the grant endpoint's slug-facing API, which has its own e2e specs).
   */
  async createScholarScopedUser(
    scholarId: string,
    permissionType: 'OWN_CONTENT' | 'ASSIGNED_EDITOR' = 'OWN_CONTENT',
  ) {
    const auth = await this.createUser();
    await this.prisma.userScholarRole.create({
      data: { userId: auth.user.id, scholarId, permissionType },
    });
    return auth;
  }

  /**
   * Creates a listener-level user with a translator role grant (optionally
   * scoped to a single scholar by id), with no global permissions. Used to
   * prove locale-scoped ability rules.
   */
  async createTranslatorScopedUser(
    locales: string[],
    options: { scholarId?: string | null; canPublish?: boolean } = {},
  ) {
    const auth = await this.createUser();
    const scholarId = options.scholarId ?? null;
    const canPublish = options.canPublish ?? false;
    await this.prisma.userTranslatorRole.createMany({
      data: locales.map((locale) => ({ userId: auth.user.id, scholarId, locale, canPublish })),
    });
    return auth;
  }

  async cleanup(): Promise<void> {
    if (this.createdUserIds.size === 0) return;
    const ids = Array.from(this.createdUserIds);
    await this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
    this.createdUserIds.clear();
  }
}

type AccessGrantSeed = {
  target: AccessTarget;
  capability: AccessCapability;
  scholarId: null;
  locale: null;
};

function grantsForPermission(permission: Permission): AccessGrantSeed[] {
  switch (permission) {
    case Permission.SCHOLARS_CREATE:
    case Permission.SCHOLARS_EDIT:
      return [
        {
          target: AccessTarget.scholar,
          capability: AccessCapability.write,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.SCHOLARS_DELETE:
      return [
        {
          target: AccessTarget.scholar,
          capability: AccessCapability.delete,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.SCHOLARS_PUBLISH:
      return [
        {
          target: AccessTarget.scholar,
          capability: AccessCapability.publish,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.LISTINGS_CREATE:
    case Permission.LISTINGS_EDIT:
      return [
        {
          target: AccessTarget.listing,
          capability: AccessCapability.write,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.LISTINGS_DELETE:
      return [
        {
          target: AccessTarget.listing,
          capability: AccessCapability.delete,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.LISTINGS_PUBLISH:
      return [
        {
          target: AccessTarget.listing,
          capability: AccessCapability.publish,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.TOPICS_CREATE:
    case Permission.TOPICS_EDIT:
      return [
        {
          target: AccessTarget.topic,
          capability: AccessCapability.write,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.TOPICS_DELETE:
      return [
        {
          target: AccessTarget.topic,
          capability: AccessCapability.delete,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.TOPICS_PUBLISH:
      return [
        {
          target: AccessTarget.topic,
          capability: AccessCapability.publish,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.TRANSLATIONS_CREATE:
    case Permission.TRANSLATIONS_EDIT:
      return [
        {
          target: AccessTarget.translation,
          capability: AccessCapability.translate,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.TRANSLATIONS_PUBLISH:
      return [
        {
          target: AccessTarget.translation,
          capability: AccessCapability.publish,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.MEDIA_UPLOAD:
      return [
        {
          target: AccessTarget.media,
          capability: AccessCapability.write,
          scholarId: null,
          locale: null,
        },
      ];
    case Permission.USERS_GRANT_PERMISSIONS:
    case Permission.USERS_GRANT_ROLES:
      return [
        {
          target: AccessTarget.user,
          capability: AccessCapability.manage,
          scholarId: null,
          locale: null,
        },
      ];
    default:
      return [];
  }
}
