import { Injectable } from '@nestjs/common';
import { PrismaService, Status } from '@sd/core-db';

@Injectable()
export class ListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedLecture(id: string) {
    return this.prisma.lecture.findUnique({
      where: { id, status: Status.published },
      select: { id: true },
    });
  }

  async findPublishedSeries(id: string) {
    return this.prisma.series.findUnique({
      where: { id, status: Status.published },
      select: { id: true },
    });
  }

  async findPublishedCollection(id: string) {
    return this.prisma.collection.findUnique({
      where: { id, status: Status.published },
      select: { id: true },
    });
  }
}
