import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class AppleNativeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAccountByProviderId(providerId: string, providerAccountId: string) {
    return this.prisma.account.findFirst({
      where: { providerId, providerAccountId },
    });
  }

  async createUser(data: { name: string; email: string }, emailVerified: boolean) {
    return this.prisma.user.create({
      data: { ...data, emailVerified },
    });
  }

  async createAccount(data: { userId: string; providerId: string; providerAccountId: string }) {
    return this.prisma.account.create({
      data: { ...data, type: 'oidc' },
    });
  }

  async createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.prisma.session.create({
      data: { userId, expiresAt },
    });
  }
}
