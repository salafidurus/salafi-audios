import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScholarService } from './scholars.service';
import { ScholarRepository } from './scholars.repo';
import { UpsertScholarDto } from './dto/upsert-scholar.dto';
import { ScholarDetailDto } from './dto/scholar-detail.dto';
import { ScholarViewDto } from './dto/scholar-view.dto';

describe('ScholarService', () => {
  let service: ScholarService;
  let repo: jest.Mocked<ScholarRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScholarService,
        {
          provide: ScholarRepository,
          useValue: {
            upsertBySlug: jest.fn(),
            findActiveDetailBySlug: jest.fn(),
            listActive: jest.fn(),
          } satisfies Partial<jest.Mocked<ScholarRepository>>,
        },
      ],
    }).compile();

    service = module.get(ScholarService);
    repo = module.get(ScholarRepository) as jest.Mocked<ScholarRepository>;
  });

  it('listActiveScholars returns repo results', async () => {
    const data: ScholarViewDto[] = [
      { id: '1', slug: 'a', name: 'A', bio: undefined, isActive: true },
    ];
    repo.listActive.mockResolvedValue(data);

    await expect(service.listActiveScholars()).resolves.toEqual(data);
  });

  it('getActiveScholarBySlug throws NotFoundException if missing', async () => {
    repo.findActiveDetailBySlug.mockResolvedValue(null);

    await expect(
      service.getActiveScholarBySlug('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upsertScholar forwards dto to repo and returns detail dto', async () => {
    const input: UpsertScholarDto = { slug: 'ibn-baz', name: 'Ibn Baz' };

    const out: ScholarDetailDto = {
      id: '1',
      slug: 'ibn-baz',
      name: 'Ibn Baz',
      bio: undefined,
      country: undefined,
      mainLanguage: undefined,
      imageUrl: undefined,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      updatedAt: undefined,
    };

    repo.upsertBySlug.mockResolvedValue(out);

    await expect(service.upsertScholar(input)).resolves.toEqual(out);
    expect(repo.upsertBySlug).toHaveBeenCalledWith(input);
  });
});
