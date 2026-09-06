import { Injectable } from '@nestjs/common';
import { PrimaryDbService } from '../db/primary-db.service';
import { randomBytes } from 'crypto';

/** NestJS apple native repository service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** Core API apple native.repo module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AppleNativeRepository {
  constructor(private readonly prisma: PrimaryDbService) {}

  async findAccountByProviderId(providerId: string, accountId: string) {
    return this.prisma.account.findFirst({
      where: { providerId, accountId },
    });
  }

  async createUser(data: { name: string; email: string }, emailVerified: boolean) {
    return this.prisma.user.create({
      data: { ...data, emailVerified },
    });
  }

  // oxlint-disable-next-line anti-slop/require-tsdoc -- Inline structural field is covered by the enclosing API method contract.
  async createAccount(data: { userId: string; providerId: string; accountId: string }) {
    return this.prisma.account.create({
      data: { ...data, issuer: 'https://appleid.apple.com' },
    });
  }

  async createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = randomBytes(32).toString('hex');
    return this.prisma.session.create({
      data: { userId, expiresAt, token },
    });
  }
}
