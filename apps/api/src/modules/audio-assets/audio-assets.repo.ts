import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';
import { ListingRepository } from '../listing/listing.repo';
import type { AudioAssetViewDto } from '@sd/core-contracts';

interface AddAudioAssetDto {
  audioKey: string;
  durationSeconds?: number;
  sizeBytes?: number;
  format?: string;
}

@Injectable()
export class AudioAssetsRepository {
  constructor(
    private prisma: PrismaService,
    private listingRepo: ListingRepository,
  ) {}

  async listByListing(listingId: string): Promise<AudioAssetViewDto[]> {
    const assets = await this.prisma.audioAsset.findMany({
      where: { listingId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
    return assets.map((asset) => this.formatViewDto(asset));
  }

  async add(listingId: string, dto: AddAudioAssetDto): Promise<AudioAssetViewDto> {
    return this.prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUniqueOrThrow({ where: { id: listingId } });

      await tx.audioAsset.updateMany({
        where: { listingId, isPrimary: true },
        data: { isPrimary: false },
      });

      const [asset, updated] = await Promise.all([
        tx.audioAsset.create({
          data: {
            listingId,
            url: this.publicUrlFor(dto.audioKey),
            format: dto.format,
            durationSeconds: dto.durationSeconds,
            sizeBytes: dto.sizeBytes,
            isPrimary: true,
          },
        }),
        tx.listing.update({
          where: { id: listingId },
          data: { durationSeconds: dto.durationSeconds },
        }),
      ]);

      if (updated.parentId) {
        await this.listingRepo.syncListingCounters(updated.parentId, tx);
      }

      return this.formatViewDto(asset);
    });
  }

  async promote(listingId: string, assetId: string): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.audioAsset.findUniqueOrThrow({ where: { id: assetId } });

      if (asset.listingId !== listingId) {
        throw new BadRequestException('Asset does not belong to this listing');
      }

      await tx.audioAsset.updateMany({
        where: { listingId, isPrimary: true },
        data: { isPrimary: false },
      });

      const promoted = await tx.audioAsset.update({
        where: { id: assetId },
        data: { isPrimary: true },
      });

      const listing = await tx.listing.update({
        where: { id: listingId },
        data: { durationSeconds: promoted.durationSeconds },
      });

      if (listing.parentId) {
        await this.listingRepo.syncListingCounters(listing.parentId, tx);
      }
    });
  }

  async delete(listingId: string, assetId: string): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const [asset, siblingCount, listing] = await Promise.all([
        tx.audioAsset.findUniqueOrThrow({ where: { id: assetId } }),
        tx.audioAsset.count({ where: { listingId, id: { not: assetId } } }),
        tx.listing.findUniqueOrThrow({ where: { id: listingId } }),
      ]);

      if (asset.listingId !== listingId) {
        throw new BadRequestException('Asset does not belong to this listing');
      }

      if (asset.isPrimary && siblingCount > 0) {
        throw new BadRequestException('Promote another asset to primary before deleting');
      }

      if (asset.isPrimary && siblingCount === 0) {
        if (listing.status !== 'draft') {
          throw new BadRequestException('Cannot delete sole asset from published listing');
        }

        await tx.audioAsset.delete({ where: { id: assetId } });

        const updated = await tx.listing.update({
          where: { id: listingId },
          data: { durationSeconds: null },
        });

        if (updated.parentId) {
          await this.listingRepo.syncListingCounters(updated.parentId, tx);
        }
        return;
      }

      await tx.audioAsset.delete({ where: { id: assetId } });
    });
  }

  private publicUrlFor(audioKey: string): string {
    const bucket = process.env.R2_BUCKET_NAME || 'salafi-audios-dev';
    const domain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn.example.com';
    return `${domain}/${bucket}/${audioKey}`;
  }

  private formatViewDto(asset: any): AudioAssetViewDto {
    return {
      id: asset.id,
      listingId: asset.listingId,
      url: asset.url,
      format: asset.format ?? undefined,
      sizeBytes: asset.sizeBytes ? Number(asset.sizeBytes) : undefined,
      durationSeconds: asset.durationSeconds ?? undefined,
      bitrateKbps: asset.bitrateKbps ?? undefined,
      source: asset.source ?? undefined,
      isPrimary: asset.isPrimary ?? undefined,
      createdAt: asset.createdAt instanceof Date ? asset.createdAt.toISOString() : asset.createdAt,
    };
  }
}
