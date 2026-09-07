import { Injectable, NotFoundException } from '@nestjs/common';
import type { ScholarFollowDto } from '@sd/core-contracts';
import type { Prisma } from '@sd/core-db';
import { PrimaryDbService } from '../../core/db/primary-db.service';
import { AnalyticsDispatchRepository } from '../analytics/analytics-dispatch.repository';

@Injectable()
/** Service for transactional scholar follow state and analytics intents. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- Service behavior is documented by the boundary comment above.
export class ScholarFollowService {
  constructor(
    private readonly prisma: PrimaryDbService,
    private readonly analyticsDispatch?: AnalyticsDispatchRepository,
  ) {}

  async getStatus(userId: string, scholarSlug: string): Promise<ScholarFollowDto> {
    const scholar = await this.findScholar(scholarSlug);
    const follow = await this.prisma.scholarFollow.findUnique({
      where: { userId_scholarId: { userId, scholarId: scholar.id } },
      select: { userId: true },
    });
    return { scholarSlug: scholar.slug, following: Boolean(follow) };
  }

  follow(userId: string, scholarSlug: string): Promise<ScholarFollowDto> {
    return this.transition(userId, scholarSlug, true);
  }

  unfollow(userId: string, scholarSlug: string): Promise<ScholarFollowDto> {
    return this.transition(userId, scholarSlug, false);
  }

  private async transition(userId: string, scholarSlug: string, following: boolean) {
    return this.prisma.$transaction(async (transaction) => {
      const scholar = await this.findScholar(scholarSlug, transaction);
      const existing = await transaction.scholarFollow.findUnique({
        where: { userId_scholarId: { userId, scholarId: scholar.id } },
        select: { userId: true },
      });
      const changed = Boolean(existing) !== following;
      if (following) {
        await transaction.scholarFollow.upsert({
          where: { userId_scholarId: { userId, scholarId: scholar.id } },
          create: { userId, scholarId: scholar.id },
          update: {},
        });
      } else {
        await transaction.scholarFollow.deleteMany({
          where: { userId, scholarId: scholar.id },
        });
      }
      if (changed && this.analyticsDispatch) {
        await this.analyticsDispatch.append(transaction, {
          eventName: following ? 'scholar_followed' : 'scholar_unfollowed',
          subjectId: userId,
          payload: { scholar_id: scholar.id } satisfies Prisma.InputJsonObject,
        });
      }
      return { scholarSlug: scholar.slug, following };
    });
  }

  private async findScholar(
    slug: string,
    db: PrimaryDbService | Prisma.TransactionClient = this.prisma,
  ): Promise<{ id: string; /** Public scholar slug used in API responses. */ slug: string }> {
    const scholar = await db.scholar.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!scholar) throw new NotFoundException(`Scholar "${slug}" not found`);
    return scholar;
  }
}
