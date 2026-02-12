import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionRepository } from './collections.repo';
import { CollectionViewDto } from './dto/collection-view.dto';
import { UpsertCollectionDto } from './dto/upsert-collection.dto';

@Injectable()
export class CollectionService {
  constructor(private readonly repo: CollectionRepository) {}

  async listPublished(scholarSlug: string): Promise<CollectionViewDto[]> {
    // keep behavior: if scholar missing => []
    return this.repo.listPublishedByScholarSlug(scholarSlug);
  }

  async getPublished(
    scholarSlug: string,
    slug: string,
  ): Promise<CollectionViewDto> {
    const found = await this.repo.findPublishedByScholarSlugAndSlug(
      scholarSlug,
      slug,
    );

    if (!found) {
      throw new NotFoundException(`Collection "${slug}" not found`);
    }

    return found;
  }

  async getPublishedById(id: string): Promise<CollectionViewDto> {
    const found = await this.repo.findPublishedById(id);
    if (!found) throw new NotFoundException('Collection not found');
    return found;
  }

  async upsert(
    scholarSlug: string,
    dto: UpsertCollectionDto,
  ): Promise<CollectionViewDto> {
    const result = await this.repo.upsertByScholarSlug(scholarSlug, dto);

    if (!result) {
      throw new NotFoundException(`Scholar "${scholarSlug}" not found`);
    }

    return result;
  }
}
