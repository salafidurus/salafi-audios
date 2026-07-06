import { Injectable } from '@nestjs/common';
import { Status } from '@sd/core-db';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class SitemapRepo {
  constructor(private readonly prisma: PrismaService) {}

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
