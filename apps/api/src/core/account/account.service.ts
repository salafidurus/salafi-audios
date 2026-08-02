import { Injectable } from '@nestjs/common';
import { packRules } from '@casl/ability/extra';
import type { UserProfileDto } from '@sd/core-contracts';
import { PrismaService } from '../db/prisma.service';
import { defineAbilityFor } from '../auth/ability/ability.factory';
import type { ScholarLinkAttribute, TranslatorRoleAttribute } from '../auth/ability/ability.types';

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  roles: string[];
  permissions?: string[];
  scholarLinks?: ScholarLinkAttribute[];
  translatorRoles?: TranslatorRoleAttribute[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(user: AuthenticatedUser): UserProfileDto {
    const permissions = user.permissions ?? [];
    const scholarLinks = user.scholarLinks ?? [];
    const translatorRoles = user.translatorRoles ?? [];

    // Packed so the client can rebuild an identical CASL ability
    // (unpackRules + createMongoAbility) for UI gating — convenience only,
    // the backend PolicyGuard is the real, re-checked-per-request enforcement.
    const ability = defineAbilityFor({
      roles: user.roles,
      permissions,
      scholarLinks,
      translatorRoles,
    });
    const rules = packRules(ability.rules);

    return {
      id: user.id,
      email: user.email,
      displayName: user.name,
      avatarUrl: user.image ?? undefined,
      emailVerified: user.emailVerified,
      roles: user.roles,
      permissions,
      scholarLinks,
      translatorRoles,
      rules,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateProfile(userId: string, displayName: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: displayName },
      include: { roles: true },
    });
    return this.getProfile({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      roles: user.roles.map((r) => r.role),
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
