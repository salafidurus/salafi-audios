import { Injectable } from '@nestjs/common';
import type { UserProfileDto } from '@sd/core-contracts';

@Injectable()
export class AccountService {
  getProfile(user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.name,
      avatarUrl: user.image ?? undefined,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
