import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma } from '@sd/db/client';
import { UpsertScholarDto } from './dto/upsert-scholar.dto';
import { ScholarViewDto } from './dto/scholar-view.dto';
import { ScholarDetailDto } from './dto/scholar-detail.dto';

const scholarViewSelect = {
  id: true,
  slug: true,
  name: true,
  bio: true,
  isActive: true,
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
      },
      update: {
        name: input.name,
        bio: input.bio,
        country: input.country,
        mainLanguage: input.mainLanguage,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
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
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
    };
  }
}
