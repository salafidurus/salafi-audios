import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma } from '@sd/db/client';
import { AudioAssetViewDto } from './dto/audio-asset-view.dto';
import { UpsertAudioAssetDto } from './dto/upsert-audio-asset.dto';

const audioAssetViewSelect = {
  id: true,
  lectureId: true,
  url: true,
  format: true,
  bitrateKbps: true,
  sizeBytes: true,
  durationSeconds: true,
  source: true,
  isPrimary: true,
  createdAt: true,
} satisfies Prisma.AudioAssetSelect;

type AudioAssetViewRecord = Prisma.AudioAssetGetPayload<{
  select: typeof audioAssetViewSelect;
}>;

@Injectable()
export class AudioAssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByLectureId(
    lectureId: string,
  ): Promise<AudioAssetViewDto[] | null> {
    // Return null if lecture doesn't exist (service decides how to 404)
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      select: { id: true },
    });
    if (!lecture) return null;

    const records = await this.prisma.audioAsset.findMany({
      where: { lectureId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: audioAssetViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  async findById(id: string): Promise<AudioAssetViewDto | null> {
    const record = await this.prisma.audioAsset.findUnique({
      where: { id },
      select: audioAssetViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  /**
   * Upsert by (lectureId + url). This is a practical idempotent key for ingestion.
   * - Returns null if lecture doesn't exist
   * - If isPrimary=true: we ensure only one primary per lecture by clearing others first
   */
  async upsertByLectureIdAndUrl(
    lectureId: string,
    input: UpsertAudioAssetDto,
  ): Promise<AudioAssetViewDto | null> {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      select: { id: true },
    });
    if (!lecture) return null;

    const wantsPrimary = input.isPrimary === true;

    const record = await this.prisma.$transaction(async (tx) => {
      if (wantsPrimary) {
        await tx.audioAsset.updateMany({
          where: { lectureId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const existing = await tx.audioAsset.findFirst({
        where: { lectureId, url: input.url },
        select: { id: true },
      });

      if (!existing) {
        return tx.audioAsset.create({
          data: {
            lectureId,
            url: input.url,
            format: input.format,
            bitrateKbps: input.bitrateKbps,
            sizeBytes: input.sizeBytes ? BigInt(input.sizeBytes) : null,
            durationSeconds: input.durationSeconds,
            source: input.source,
            isPrimary: wantsPrimary,
          },
          select: audioAssetViewSelect,
        });
      }

      return tx.audioAsset.update({
        where: { id: existing.id },
        data: {
          url: input.url,
          format: input.format,
          bitrateKbps: input.bitrateKbps,
          sizeBytes: input.sizeBytes ? BigInt(input.sizeBytes) : null,
          durationSeconds: input.durationSeconds,
          source: input.source,
          isPrimary: wantsPrimary,
        },
        select: audioAssetViewSelect,
      });
    });

    return this.toViewDto(record);
  }

  private toViewDto(record: AudioAssetViewRecord): AudioAssetViewDto {
    return {
      id: record.id,
      lectureId: record.lectureId,
      url: record.url,
      format: record.format ?? undefined,
      bitrateKbps: record.bitrateKbps ?? undefined,
      sizeBytes:
        record.sizeBytes !== null ? record.sizeBytes.toString() : undefined,
      durationSeconds: record.durationSeconds ?? undefined,
      source: record.source ?? undefined,
      isPrimary: record.isPrimary,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
