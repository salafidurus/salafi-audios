import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Prisma } from '@sd/core-db';
import {
  ScholarViewDto,
  ScholarDetailDto,
  ScholarStatsDto,
} from '@sd/core-contracts';
import { UpsertScholarDto } from './dto/upsert-scholar.dto';

const scholarViewSelect = {
  id: true,
  slug: true,
  name: true,
  bio: true,
  isActive: true,
  isKibar: true,
} satisfies Prisma.ScholarSelect;

type ScholarViewRecord = Prisma.ScholarGetPayload<{
  select: typeof scholarViewSelect;
}>;

const scholarDetailSelect = {
  id: true,
  slug: true,
  name: true,
  bio: true,
  country: true,
  mainLanguage: true,
  imageUrl: true,
  isActive: true,
  isKibar: true,
  socialTwitter: true,
  socialTelegram: true,
  socialYoutube: true,
  socialWebsite: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ScholarSelect;

type ScholarDetailRecord = Prisma.ScholarGetPayload<{
  select: typeof scholarDetailSelect;
}>;

@Injectable()
export class ScholarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertBySlug(input: UpsertScholarDto): Promise<ScholarDetailDto> {
    const record = await this.prisma.scholar.upsert({
      where: { slug: input.slug },
      select: scholarDetailSelect,
      create: {
        slug: input.slug,
        name: input.name,
        bio: input.bio,
        country: input.country,
        mainLanguage: input.mainLanguage,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
        isKibar: input.isKibar ?? false,
      },
      update: {
        name: input.name,
        bio: input.bio,
        country: input.country,
        mainLanguage: input.mainLanguage,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
        isKibar: input.isKibar ?? false,
      },
    });

    return this.toDetailDto(record);
  }

  async findActiveDetailBySlug(slug: string): Promise<ScholarDetailDto | null> {
    const record = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: scholarDetailSelect,
    });

    return record ? this.toDetailDto(record) : null;
  }

  async listActive(): Promise<ScholarViewDto[]> {
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: scholarViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  async updateKibarById(
    id: string,
    isKibar: boolean,
  ): Promise<ScholarDetailDto | null> {
    const record = await this.prisma.scholar.update({
      where: { id },
      select: scholarDetailSelect,
      data: { isKibar },
    });

    return record ? this.toDetailDto(record) : null;
  }

  // ------------------------
  // Mapping (repo-owned)
  // ------------------------
  private toViewDto(record: ScholarViewRecord): ScholarViewDto {
    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      bio: record.bio ?? undefined,
      isActive: record.isActive,
      isKibar: record.isKibar,
    };
  }

  private toDetailDto(record: ScholarDetailRecord): ScholarDetailDto {
    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      bio: record.bio ?? undefined,
      country: record.country ?? undefined,
      mainLanguage: record.mainLanguage ?? undefined,
      imageUrl: record.imageUrl ?? undefined,
      isActive: record.isActive,
      isKibar: record.isKibar,
      socialTwitter: record.socialTwitter ?? undefined,
      socialTelegram: record.socialTelegram ?? undefined,
      socialYoutube: record.socialYoutube ?? undefined,
      socialWebsite: record.socialWebsite ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
    };
  }

  async getScholarStats(scholarId: string): Promise<ScholarStatsDto> {
    const [
      seriesCount,
      lecturesCount,
      collectionsCount,
      standaloneSeriesCount,
      standaloneLecturesCount,
    ] = await Promise.all([
      this.prisma.series.count({
        where: {
          scholarId,
          status: 'published',
          deletedAt: null,
        },
      }),
      this.prisma.lecture.count({
        where: {
          scholarId,
          status: 'published',
          deletedAt: null,
        },
      }),
      this.prisma.collection.count({
        where: {
          scholarId,
          status: 'published',
          deletedAt: null,
        },
      }),
      this.prisma.series.count({
        where: {
          scholarId,
          status: 'published',
          deletedAt: null,
          collectionId: null,
        },
      }),
      this.prisma.lecture.count({
        where: {
          scholarId,
          status: 'published',
          deletedAt: null,
          seriesId: null,
        },
      }),
    ]);

    // TODO: Compute follower count from analytics
    const followerCount = 0;

    return {
      seriesCount,
      lecturesCount,
      followerCount,
      collectionsCount,
      standaloneSeriesCount,
      standaloneLecturesCount,
    };
  }
}
