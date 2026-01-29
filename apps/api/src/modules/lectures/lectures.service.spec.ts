import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repo';
import { LectureViewDto } from './dto/lecture-view.dto';
import { UpsertLectureDto } from './dto/upsert-lecture.dto';
import { Status } from '@sd/db/client';

describe('LecturesService', () => {
  let service: LecturesService;
  let repo: jest.Mocked<LecturesRepository>;

  const sample: LectureViewDto = {
    id: 'l1',
    scholarId: 'sc1',
    slug: 'lecture-1',
    title: 'Lecture 1',
    status: Status.published,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturesService,
        {
          provide: LecturesRepository,
          useValue: {
            listPublishedByScholarSlug: jest.fn(),
            findPublishedByScholarSlugAndSlug: jest.fn(),
            upsertByScholarSlug: jest.fn(),
          } satisfies Partial<jest.Mocked<LecturesRepository>>,
        },
      ],
    }).compile();

    service = module.get(LecturesService);
    repo = module.get(LecturesRepository) as jest.Mocked<LecturesRepository>;
  });

  it('getPublished throws NotFoundException when missing', async () => {
    repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(null);
    await expect(service.getPublished('sch', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert throws NotFoundException when parent missing', async () => {
    const dto: UpsertLectureDto = { slug: 'l', title: 't' };
    repo.upsertByScholarSlug.mockResolvedValue(null);
    await expect(service.upsert('missing-scholar', dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert returns DTO from repo', async () => {
    const dto: UpsertLectureDto = {
      slug: 'lecture-1',
      title: 'Lecture 1',
      status: Status.published,
    };
    repo.upsertByScholarSlug.mockResolvedValue(sample);

    await expect(service.upsert('sch', dto)).resolves.toEqual(sample);
    expect(repo.upsertByScholarSlug).toHaveBeenCalledWith('sch', dto);
  });
});
