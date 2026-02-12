import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectionService } from './collections.service';
import { CollectionRepository } from './collections.repo';
import { UpsertCollectionDto } from './dto/upsert-collection.dto';
import { CollectionViewDto } from './dto/collection-view.dto';
import { Status } from '@sd/db/client';

describe('CollectionService', () => {
  let service: CollectionService;
  let repo: jest.Mocked<CollectionRepository>;

  const sample: CollectionViewDto = {
    id: 'c1',
    scholarId: 's1',
    slug: 'col-1',
    title: 'Collection 1',
    status: Status.published,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: CollectionRepository,
          useValue: {
            listPublishedByScholarSlug: jest.fn(),
            findPublishedByScholarSlugAndSlug: jest.fn(),
            upsertByScholarSlug: jest.fn(),
          } satisfies Partial<jest.Mocked<CollectionRepository>>,
        },
      ],
    }).compile();

    service = module.get(CollectionService);
    repo = module.get(
      CollectionRepository,
    ) as jest.Mocked<CollectionRepository>;
  });

  it('getPublished throws NotFoundException when missing', async () => {
    repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(null);

    await expect(service.getPublished('sch', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert throws NotFoundException when scholar missing', async () => {
    const dto: UpsertCollectionDto = { slug: 'col-1', title: 'Collection 1' };
    repo.upsertByScholarSlug.mockResolvedValue(null);

    await expect(service.upsert('missing-scholar', dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert returns DTO from repo', async () => {
    const dto: UpsertCollectionDto = {
      slug: 'col-1',
      title: 'Collection 1',
      status: Status.published,
    };
    repo.upsertByScholarSlug.mockResolvedValue(sample);

    await expect(service.upsert('sch', dto)).resolves.toEqual(sample);
    expect(repo.upsertByScholarSlug).toHaveBeenCalledWith('sch', dto);
  });
});
