import { Injectable } from '@nestjs/common';
import { packRules } from '@casl/ability/extra';
import type { UserProfileDto } from '@sd/core-contracts';
import { PrismaService } from '../db/prisma.service';
import { defineAbilityFor } from '../auth/ability/ability.factory';
import type { AccessGrantAttribute } from '../auth/ability/ability.types';

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  roles?: string[];
  accessGrants?: AccessGrantAttribute[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(user: AuthenticatedUser): UserProfileDto {
    const roles = deriveAccessRoles(user.roles ?? ['listener'], user.accessGrants ?? []);

    // Packed so the client can rebuild an identical CASL ability
    // (unpackRules + createMongoAbility) for UI gating — convenience only,
    // the backend PolicyGuard is the real, re-checked-per-request enforcement.
    const ability = defineAbilityFor({
      roles: user.roles ?? ['listener'],
      accessGrants: user.accessGrants,
    });
    const rules = packRules(ability.rules);

    return {
      id: user.id,
      email: user.email,
      displayName: user.name,
      avatarUrl: user.image ?? undefined,
      emailVerified: user.emailVerified,
      roles,
      rules,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateProfile(userId: string, displayName: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: displayName },
      include: { roles: true, accessGrants: { include: { scholar: { select: { slug: true } } } } },
    });
    return this.getProfile({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      roles: user.roles.map((r) => r.role),
      accessGrants: user.accessGrants.map(({ scholar, ...grant }) => ({
        ...grant,
        scholarSlug: scholar?.slug ?? null,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}

function deriveAccessRoles(systemRoles: string[], grants: AccessGrantAttribute[]): string[] {
  const roles = new Set<string>();
  if (systemRoles.includes('superadmin')) roles.add('Superadmin');
  if (grants.some((grant) => grant.capability === 'write')) roles.add('Editor');
  if (grants.some((grant) => grant.capability === 'translate')) roles.add('Translator');
  if (grants.some((grant) => grant.capability === 'publish')) roles.add('Publisher');
  if (grants.some((grant) => grant.capability === 'delete')) roles.add('Deleter');
  if (grants.some((grant) => grant.target === 'user' && grant.capability === 'manage')) {
    roles.add('User manager');
  }
  return roles.size ? [...roles].sort() : ['Listener'];
}
