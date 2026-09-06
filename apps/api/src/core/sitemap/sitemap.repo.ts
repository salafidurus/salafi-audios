import { Injectable } from '@nestjs/common';
import { Status } from '@sd/core-db';
import { PrimaryDbService } from '../db/primary-db.service';

/** NestJS sitemap repo service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** Core API sitemap.repo module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class SitemapRepo {
  constructor(private readonly prisma: PrimaryDbService) {}

  findActiveScholars() {
    return this.prisma.scholar.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: 'asc' },
    });
  }

  findPublishedTopLevelListings() {
    return this.prisma.listing.findMany({
      where: { deletedAt: null, status: Status.published, parentId: null },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: 'asc' },
    });
  }
}
