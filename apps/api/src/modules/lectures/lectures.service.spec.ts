import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Status } from '@sd/core-db';
import type {
  AdminLectureUpdateDto,
  LectureDetailDto,
  RelatedLectureDto,
} from '@sd/core-contracts';
import { LecturesRepository } from './lectures.repo';
import { LecturesService } from './lectures.service';

describe('LecturesService', () => {
  let service: LecturesService;
  let repo: jest.Mocked<LecturesRepository>;

  const lectureDetail: LectureDetailDto = {
    id: 'lecture-1',
    slug: 'kitab-at-tawhid-1',
    title: 'Kitab at-Tawhid 1',
    description: 'Opening lesson',
    language: 'ar',
    durationSeconds: 3600,
    publishedAt: '2026-04-01T00:00:00.000Z',
    scholar: {
      id: 'scholar-1',
      slug: 'ibn-baz',
      name: 'Ibn Baz',
      imageUrl: undefined,
    },
    topics: [
      {
        id: 'topic-1',
        slug: 'tawhid',
        name: 'Tawhid',
      },
    ],
    primaryAudioAsset: null,
    seriesContext: null,
  };

  const relatedLectures: RelatedLectureDto[] = [
    {
      id: 'lecture-2',
      slug: 'kitab-at-tawhid-2',
      title: 'Kitab at-Tawhid 2',
      durationSeconds: 3500,
      scholar: lectureDetail.scholar,
      primaryAudioAsset: null,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturesService,
        {
          provide: LecturesRepository,
          useValue: {
            findDetailById: jest.fn(),
            findRelated: jest.fn(),
            updateLecture: jest.fn(),
            updateLectureStatus: jest.fn(),
          } satisfies Partial<jest.Mocked<LecturesRepository>>,
        },
      ],
    }).compile();

    service = module.get(LecturesService);
    repo = module.get(LecturesRepository) as jest.Mocked<LecturesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('returns lecture detail when found', async () => {
      repo.findDetailById.mockResolvedValue(lectureDetail);

      await expect(service.getById('lecture-1')).resolves.toEqual(lectureDetail);
      expect(repo.findDetailById).toHaveBeenCalledWith('lecture-1');
    });

    it('throws when the lecture does not exist', async () => {
      repo.findDetailById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toThrow(
        new NotFoundException('Lecture "missing" not found'),
      );
    });
  });

  describe('getRelated', () => {
    it('returns related lectures from the repository', async () => {
      repo.findRelated.mockResolvedValue(relatedLectures);

      await expect(service.getRelated('lecture-1')).resolves.toEqual(relatedLectures);
      expect(repo.findRelated).toHaveBeenCalledWith('lecture-1');
    });
  });

  describe('updateLecture', () => {
    it('returns a success payload when the lecture is updated', async () => {
      const dto: AdminLectureUpdateDto = { title: 'Updated title' };
      repo.updateLecture.mockResolvedValue(true);

      await expect(service.updateLecture('lecture-1', dto)).resolves.toEqual({
        success: true,
        message: 'Lecture updated successfully',
      });
      expect(repo.updateLecture).toHaveBeenCalledWith('lecture-1', dto);
    });

    it('throws when updating a missing lecture', async () => {
      repo.updateLecture.mockResolvedValue(false);

      await expect(service.updateLecture('missing', {})).rejects.toThrow(
        new NotFoundException('Lecture "missing" not found'),
      );
    });
  });

  describe('publishLecture', () => {
    it('publishes the lecture through the repository', async () => {
      repo.updateLectureStatus.mockResolvedValue(true);

      await expect(service.publishLecture('lecture-1')).resolves.toEqual({
        success: true,
        message: 'Lecture published successfully',
      });
      expect(repo.updateLectureStatus).toHaveBeenCalledWith(
        'lecture-1',
        Status.published,
      );
    });

    it('throws when publishing a missing lecture', async () => {
      repo.updateLectureStatus.mockResolvedValue(false);

      await expect(service.publishLecture('missing')).rejects.toThrow(
        new NotFoundException('Lecture "missing" not found'),
      );
    });
  });

  describe('archiveLecture', () => {
    it('archives the lecture through the repository', async () => {
      repo.updateLectureStatus.mockResolvedValue(true);

      await expect(service.archiveLecture('lecture-1')).resolves.toEqual({
        success: true,
        message: 'Lecture archived successfully',
      });
      expect(repo.updateLectureStatus).toHaveBeenCalledWith(
        'lecture-1',
        Status.archived,
      );
    });

    it('throws when archiving a missing lecture', async () => {
      repo.updateLectureStatus.mockResolvedValue(false);

      await expect(service.archiveLecture('missing')).rejects.toThrow(
        new NotFoundException('Lecture "missing" not found'),
      );
    });
  });
});
