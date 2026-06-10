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
import type { CreateLectureDto } from './dto/create-lecture.dto';

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
            listAdmin: jest.fn(),
            findAdminDetail: jest.fn(),
            createWithAudioAsset: jest.fn(),
            bulkUpdateStatus: jest.fn(),
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

      await expect(service.getById('lecture-1')).resolves.toEqual(
        lectureDetail,
      );
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

      await expect(service.getRelated('lecture-1')).resolves.toEqual(
        relatedLectures,
      );
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

  describe('listAdmin', () => {
    it('returns paginated lecture list with scholar name', async () => {
      repo.listAdmin.mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Test Lecture',
            scholarName: 'Sheikh Test',
            status: 'published',
            durationSeconds: 3600,
            orderIndex: 1,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
      });

      const result = await service.listAdmin({
        page: 1,
        scholarId: undefined,
        status: undefined,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.scholarName).toBe('Sheikh Test');
    });
  });

  describe('createLecture', () => {
    it('creates lecture and audio asset in a transaction', async () => {
      repo.createWithAudioAsset.mockResolvedValue({
        id: 'new-id',
        title: 'New Lecture',
      });
      const dto: CreateLectureDto & { publicUrl: string } = {
        title: 'New Lecture',
        scholarId: 'scholar-1',
        audioKey: 'audio/abc-file.mp3',
        publicUrl: 'https://cdn.example.com/audio/abc-file.mp3',
      };
      const result = await service.createLecture(dto);
      expect(result.id).toBe('new-id');
      expect(repo.createWithAudioAsset).toHaveBeenCalledWith(
        expect.objectContaining({ audioKey: 'audio/abc-file.mp3' }),
      );
    });
  });

  describe('bulkAction', () => {
    it('publishes multiple lectures and returns succeeded ids', async () => {
      repo.bulkUpdateStatus.mockResolvedValue({
        succeeded: ['1', '2'],
        failed: [],
      });
      const result = await service.bulkAction({
        action: 'publish',
        ids: ['1', '2'],
      });
      expect(result.succeeded).toEqual(['1', '2']);
      expect(result.failed).toEqual([]);
    });

    it('returns failed ids when a lecture is not found', async () => {
      repo.bulkUpdateStatus.mockResolvedValue({
        succeeded: ['1'],
        failed: ['missing'],
      });
      const result = await service.bulkAction({
        action: 'archive',
        ids: ['1', 'missing'],
      });
      expect(result.failed).toContain('missing');
    });
  });
});
