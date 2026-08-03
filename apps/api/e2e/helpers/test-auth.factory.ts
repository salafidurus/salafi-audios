import { PrismaService } from '../../src/core/db/prisma.service';
import { AccessCapability, AccessTarget, UserRole } from '@sd/core-db';
import type { Locale } from '@sd/core-db';
import { createId } from '@paralleldrive/cuid2';

export type AccessGrantSeed = {
  target: AccessTarget;
  capability: AccessCapability;
  scholarSlug?: string | null;
  locale?: Locale | null;
};

export function accessGrant(
  target: AccessTarget,
  capability: AccessCapability,
  options: Pick<AccessGrantSeed, 'scholarSlug' | 'locale'> = {},
): AccessGrantSeed {
  return {
    target,
    capability,
    scholarSlug: options.scholarSlug ?? null,
    locale: options.locale ?? null,
  };
}

export class TestAuthFactory {
  private readonly createdUserIds: Set<string> = new Set();

  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    email?: string,
    roles: UserRole[] = [UserRole.listener],
    grants: AccessGrantSeed[] = [],
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

    if (grants.length > 0) {
      await this.prisma.userAccessGrant.createMany({
        data: (await this.resolveGrantScholarIds(grants)).map((grant) => ({
          target: grant.target,
          capability: grant.capability,
          scholarId: grant.scholarId,
          locale: grant.locale,
          userId: user.id,
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

  private async resolveGrantScholarIds(grants: AccessGrantSeed[]) {
    const slugs = [
      ...new Set(grants.flatMap((grant) => (grant.scholarSlug ? [grant.scholarSlug] : []))),
    ];
    const scholars = slugs.length
      ? await this.prisma.scholar.findMany({
          where: { slug: { in: slugs } },
          select: { id: true, slug: true },
        })
      : [];
    const ids = new Map(scholars.map((scholar) => [scholar.slug, scholar.id]));
    return grants.map((grant) => ({
      ...grant,
      scholarId: grant.scholarSlug ? (ids.get(grant.scholarSlug) ?? null) : null,
    }));
  }

  async createAdminUser(grants: AccessGrantSeed[] = []) {
    return this.createUser(undefined, [UserRole.admin], grants);
  }

  /**
   * Creates a listener-level user linked to a scholar (by internal id, not
   * with no global access. Used to prove scholar-scoped ability rules
   * (not the grant endpoint's slug-facing API, which has its own e2e specs).
   */
  async createScholarScopedUser(
    scholarSlug: string,
    accessProfile: 'OWN_CONTENT' | 'ASSIGNED_EDITOR' = 'OWN_CONTENT',
  ) {
    const grants =
      accessProfile === 'OWN_CONTENT'
        ? [
            accessGrant(AccessTarget.scholar, AccessCapability.write, { scholarSlug }),
            accessGrant(AccessTarget.scholar, AccessCapability.publish, { scholarSlug }),
            accessGrant(AccessTarget.listing, AccessCapability.write, { scholarSlug }),
            accessGrant(AccessTarget.listing, AccessCapability.publish, { scholarSlug }),
            accessGrant(AccessTarget.media, AccessCapability.write, { scholarSlug }),
          ]
        : [accessGrant(AccessTarget.listing, AccessCapability.write, { scholarSlug })];
    return this.createUser(undefined, [UserRole.listener], grants);
  }

  /**
   * Creates a listener-level user with a translator role grant (optionally
   * scoped to a single scholar by id), with no global access. Used to
   * prove locale-scoped ability rules.
   */
  async createTranslatorScopedUser(
    locales: string[],
    options: { scholarSlug?: string | null; canPublish?: boolean } = {},
  ) {
    const scholarSlug = options.scholarSlug ?? null;
    const canPublish = options.canPublish ?? false;
    const grants = locales.flatMap((locale) => [
      accessGrant(AccessTarget.translation, AccessCapability.translate, {
        scholarSlug,
        locale: locale as Locale,
      }),
      ...(canPublish
        ? [
            accessGrant(AccessTarget.translation, AccessCapability.publish, {
              scholarSlug,
              locale: locale as Locale,
            }),
          ]
        : []),
    ]);
    return this.createUser(undefined, [UserRole.listener], grants);
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
