import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LectureTopicsService } from './lecture-topics.service';
import { LectureTopicsRepository } from './lecture-topics.repo';
import { LectureTopicViewDto } from './dto/lecture-topic-view.dto';

describe('LectureTopicsService', () => {
  let service: LectureTopicsService;
  let repo: jest.Mocked<LectureTopicsRepository>;

  const sample: LectureTopicViewDto = {
    topic: { id: 't1', slug: 'tawheed', name: 'Tawheed' },
    attachedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LectureTopicsService,
        {
          provide: LectureTopicsRepository,
          useValue: {
            listByScholarAndLectureSlug: jest.fn(),
            attach: jest.fn(),
            detach: jest.fn(),
          } satisfies Partial<jest.Mocked<LectureTopicsRepository>>,
        },
      ],
    }).compile();

    service = module.get(LectureTopicsService);
    repo = module.get(
      LectureTopicsRepository,
    ) as jest.Mocked<LectureTopicsRepository>;
  });

  it('list should throw NotFoundException when repo returns null', async () => {
    repo.listByScholarAndLectureSlug.mockResolvedValue(null);

    await expect(service.list('s', 'l')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('attach should return dto when repo returns dto', async () => {
    repo.attach.mockResolvedValue(sample);

    await expect(service.attach('s', 'l', 'tawheed')).resolves.toEqual(sample);
  });

  it('attach should throw NotFoundException when repo returns null', async () => {
    repo.attach.mockResolvedValue(null);

    await expect(service.attach('s', 'l', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('detach should be idempotent ok:true when repo returns true', async () => {
    repo.detach.mockResolvedValue(true);

    await expect(service.detach('s', 'l', 'tawheed')).resolves.toEqual({
      ok: true,
    });
  });

  it('detach should throw NotFoundException when repo returns null', async () => {
    repo.detach.mockResolvedValue(null);

    await expect(service.detach('s', 'l', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
