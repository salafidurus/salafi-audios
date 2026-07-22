import { Injectable } from '@nestjs/common';
import type { UserProfileDto } from '@sd/core-contracts';
import { PrismaService } from '../../shared/db/prisma.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(user: AuthenticatedUser): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.name,
      avatarUrl: user.image ?? undefined,
      emailVerified: user.emailVerified,
      roles: user.roles,
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
