import { Injectable } from '@nestjs/common';
import { PrimaryDbService } from '../../core/db/primary-db.service';

/** Primary-database privacy boundary for revocable analytics identity links. */
/** Stores the revocable primary-database edge used to recover an analytics pseudonym. */
@Injectable()
/** Upserts only the user-to-pseudonym edge; deletion cascades from the user. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorator separates the class declaration from its TSDoc.
export class AnalyticsIdentityLinkRepository {
  constructor(private readonly prisma: PrimaryDbService) {}

  /** Creates or refreshes the recoverability edge for one authenticated user. */
  async upsert(userId: string, pseudonymousIdentity: string): Promise<void> {
    await this.prisma.analyticsIdentityLink.upsert({
      where: { userId },
      create: { userId, pseudonymousIdentity },
      update: { pseudonymousIdentity },
    });
  }
}
