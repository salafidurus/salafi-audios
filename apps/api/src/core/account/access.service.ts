import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AccessCapability,
  AccessTarget,
  Locale,
  ReplaceUserAccessRequest,
  UserAccessSnapshot,
} from '@sd/core-contracts';

import { PrismaService } from '../db/prisma.service';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async snapshot(userId: string): Promise<UserAccessSnapshot> {
    const [user, scholars] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
          accessGrants: { include: { scholar: { select: { slug: true } } } },
        },
      }),
      this.prisma.scholar.findMany({
        select: { slug: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    if (!user) throw new NotFoundException('User not found');

    const grouped = new Map<
      string,
      {
        target: AccessTarget;
        capability: AccessCapability;
        scholarSlugs: Set<string>;
        locales: Set<Locale>;
      }
    >();
    for (const grant of user.accessGrants) {
      const key = `${grant.target}:${grant.capability}:${grant.scholarId ? 'scoped' : 'global'}`;
      const current = grouped.get(key) ?? {
        target: grant.target,
        capability: grant.capability,
        scholarSlugs: new Set<string>(),
        locales: new Set<Locale>(),
      };
      if (grant.scholar?.slug) current.scholarSlugs.add(grant.scholar.slug);
      if (grant.locale) current.locales.add(grant.locale);
      grouped.set(key, current);
    }

    const grants = [...grouped.values()].map((grant) => ({
      target: grant.target,
      capability: grant.capability,
      scholarSlugs: [...grant.scholarSlugs].sort(),
      locales: [...grant.locales].sort(),
    }));
    const roles = new Set<string>();
    if (grants.some((grant) => grant.capability === 'write')) roles.add('Editor');
    if (grants.some((grant) => grant.capability === 'translate')) roles.add('Translator');
    if (grants.some((grant) => grant.capability === 'publish')) roles.add('Publisher');
    if (grants.some((grant) => grant.capability === 'delete')) roles.add('Deleter');
    if (grants.some((grant) => grant.target === 'user' && grant.capability === 'manage')) {
      roles.add('User manager');
    }

    return {
      userId,
      version: user.accessVersion,
      grants,
      roles: [...roles].sort(),
      isSuperadmin: user.roles.some((role) => role.role === 'superadmin'),
      scholars,
    };
  }

  async replace(
    userId: string,
    request: ReplaceUserAccessRequest,
    grantedBy: string,
  ): Promise<UserAccessSnapshot> {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) throw new NotFoundException('User not found');

    const scholarSlugs = [...new Set(request.grants.flatMap((grant) => grant.scholarSlugs))];
    const scholars = scholarSlugs.length
      ? await this.prisma.scholar.findMany({
          where: { slug: { in: scholarSlugs } },
          select: { id: true, slug: true },
        })
      : [];
    if (scholars.length !== scholarSlugs.length) {
      throw new BadRequestException('One or more scholars do not exist');
    }
    const scholarIds = new Map(scholars.map((scholar) => [scholar.slug, scholar.id]));
    const rows = request.grants.flatMap((grant) => {
      const scopes = grant.scholarSlugs.length ? grant.scholarSlugs : [null];
      const locales = grant.target === 'translation' ? grant.locales : [null];
      return scopes.flatMap((slug) =>
        locales.map((locale) => ({
          userId,
          target: grant.target,
          capability: grant.capability,
          scholarId: slug ? scholarIds.get(slug)! : null,
          locale,
          grantedBy,
        })),
      );
    });
    const uniqueRows = [
      ...new Map(
        rows.map((row) => [
          `${row.target}:${row.capability}:${row.scholarId ?? ''}:${row.locale ?? ''}`,
          row,
        ]),
      ).values(),
    ];

    // Get granter's roles outside the transaction
    const granter = await this.prisma.user.findUnique({
      where: { id: grantedBy },
      include: { roles: { select: { role: true } } },
    });
    const granterIsSuperadmin = granter?.roles?.some((r) => r.role === 'superadmin') ?? false;

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: userId, accessVersion: request.version },
        data: { accessVersion: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ConflictException('Access changed; reload and try again');
      await tx.userAccessGrant.deleteMany({ where: { userId } });
      if (uniqueRows.length) {
        // SAFETY: `uniqueRows` is built from validated request grants plus
        // resolved scholar ids, matching the userAccessGrant create shape.
        await tx.userAccessGrant.createMany({ data: uniqueRows as never });
      }

      if (granterIsSuperadmin && request.isSuperadmin !== undefined) {
        if (request.isSuperadmin) {
          await tx.userRoleAssignment.upsert({
            where: { userId_role: { userId, role: 'superadmin' } },
            create: { userId, role: 'superadmin', grantedBy },
            update: { grantedBy },
          });
        } else {
          await tx.userRoleAssignment.deleteMany({
            where: { userId, role: 'superadmin' },
          });
        }
      }
    });

    return this.snapshot(userId);
  }
}
