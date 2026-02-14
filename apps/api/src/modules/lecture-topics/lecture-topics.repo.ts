import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma } from '@sd/db';
import { LectureTopicViewDto } from './dto/lecture-topic-view.dto';

const topicSelect = {
  id: true,
  slug: true,
  name: true,
} satisfies Prisma.TopicSelect;

const lectureTopicSelect = {
  createdAt: true,
  topic: { select: topicSelect },
} satisfies Prisma.LectureTopicSelect;

type LectureTopicRecord = Prisma.LectureTopicGetPayload<{
  select: typeof lectureTopicSelect;
}>;

@Injectable()
export class LectureTopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns null if scholar/lecture not found (or not eligible).
   */
  async listByScholarAndLectureSlug(
    scholarSlug: string,
    lectureSlug: string,
  ): Promise<LectureTopicViewDto[] | null> {
    const lecture = await this.findLectureIdBySlugs(scholarSlug, lectureSlug);
    if (!lecture) return null;

    const rows = await this.prisma.lectureTopic.findMany({
      where: { lectureId: lecture.id },
      orderBy: { createdAt: 'asc' },
      select: lectureTopicSelect,
    });

    return rows.map((r) => this.toViewDto(r));
  }

  /**
   * Idempotent attach:
   * - returns null if scholar/lecture/topic not found
   * - returns the attached link DTO if attached (or already existed)
   */
  async attach(
    scholarSlug: string,
    lectureSlug: string,
    topicSlug: string,
  ): Promise<LectureTopicViewDto | null> {
    const lecture = await this.findLectureIdBySlugs(scholarSlug, lectureSlug);
    if (!lecture) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) return null;

    // Idempotent:
    // LectureTopic has @@id([lectureId, topicId]) so Prisma generates
    // a composite unique input, typically: lectureId_topicId
    const row = await this.prisma.lectureTopic.upsert({
      where: {
        lectureId_topicId: {
          lectureId: lecture.id,
          topicId: topic.id,
        },
      },
      create: {
        lectureId: lecture.id,
        topicId: topic.id,
      },
      update: {},
      select: lectureTopicSelect,
    });

    return this.toViewDto(row);
  }

  /**
   * Idempotent detach:
   * - returns null if scholar/lecture/topic not found
   * - returns true if removed OR already absent
   */
  async detach(
    scholarSlug: string,
    lectureSlug: string,
    topicSlug: string,
  ): Promise<boolean | null> {
    const lecture = await this.findLectureIdBySlugs(scholarSlug, lectureSlug);
    if (!lecture) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) return null;

    await this.prisma.lectureTopic.deleteMany({
      where: { lectureId: lecture.id, topicId: topic.id },
    });

    return true;
  }

  // ------------------------
  // Private helpers
  // ------------------------

  private async findLectureIdBySlugs(
    scholarSlug: string,
    lectureSlug: string,
  ): Promise<{ id: string } | null> {
    // Consistent with your published-catalog approach:
    // - scholar must exist + active
    // - lecture must exist
    // - lecture must not be deleted
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return null;

    const lecture = await this.prisma.lecture.findFirst({
      where: {
        scholarId: scholar.id,
        slug: lectureSlug,
        deletedAt: null,
      },
      select: { id: true },
    });

    return lecture ?? null;
  }

  private toViewDto(r: LectureTopicRecord): LectureTopicViewDto {
    return {
      topic: {
        id: r.topic.id,
        slug: r.topic.slug,
        name: r.topic.name,
      },
      attachedAt: r.createdAt.toISOString(),
    };
  }
}
