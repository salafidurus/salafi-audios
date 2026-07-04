import { Injectable, NotFoundException } from '@nestjs/common';
import type { ListingViewDto } from '@sd/core-contracts';
import { ListingRepository } from './listing.repo';

@Injectable()
export class ListingService {
  constructor(private readonly repo: ListingRepository) {}

  async getById(id: string): Promise<ListingViewDto> {
    const lecture = await this.repo.findPublishedLecture(id);
    if (lecture) return { format: 'single', id };

    const series = await this.repo.findPublishedSeries(id);
    if (series) return { format: 'series', id };

    const collection = await this.repo.findPublishedCollection(id);
    if (collection) return { format: 'collection', id };

    throw new NotFoundException(`Listing "${id}" not found`);
  }
}
