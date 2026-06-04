/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LiveRepository } from './live.repo';
import { LiveService } from './live.service';

const mockSessionRecord = {
  id: 'session-1',
  status: 'live' as const,
  title: 'Test Session',
  scheduledAt: new Date('2024-01-01T18:00:00.000Z'),
  startedAt: new Date('2024-01-01T18:05:00.000Z'),
  endedAt: null,
  updatedAt: new Date('2024-01-01T18:05:00.000Z'),
  channel: {
    displayName: 'Salafi Channel',
    telegramSlug: 'salafi_channel',
    scholar: {
      name: 'Scholar Name',
      slug: 'scholar-slug',
      imageUrl: 'image.jpg',
    },
  },
};

const mockChannelRecord = {
  id: 'channel-1',
  displayName: 'Salafi Channel',
  telegramSlug: 'salafi_channel',
  language: 'Arabic',
  isActive: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  scholar: {
    name: 'Scholar Name',
    slug: 'scholar-slug',
    imageUrl: 'image.jpg',
  },
};

describe('LiveService', () => {
  let service: LiveService;
  let repo: jest.Mocked<LiveRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveService,
        {
          provide: LiveRepository,
          useValue: {
            findActive: jest.fn(),
            findDeletedFromActive: jest.fn(),
            findUpcoming: jest.fn(),
            findDeletedFromUpcoming: jest.fn(),
            findEnded: jest.fn(),
            findDeletedFromEnded: jest.fn(),
            findSessionById: jest.fn(),
            findSessionPublicById: jest.fn(),
            updateSessionStatus: jest.fn(),
            findChannels: jest.fn(),
            findChannelBySlug: jest.fn(),
            findChannelById: jest.fn(),
            createChannel: jest.fn(),
            updateChannel: jest.fn(),
            createSession: jest.fn(),
            updateSession: jest.fn(),
          } satisfies Partial<jest.Mocked<LiveRepository>>,
        },
      ],
    }).compile();

    service = module.get(LiveService);
    repo = module.get(LiveRepository) as jest.Mocked<LiveRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActive', () => {
    it('should return mapped sessions and deletedIds when since is provided', async () => {
      repo.findActive.mockResolvedValue([mockSessionRecord] as any);
      repo.findDeletedFromActive.mockResolvedValue(['old-id-1']);

      const result = await service.getActive('2024-01-01T00:00:00.000Z');

      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0]).toMatchObject({
        id: 'session-1',
        status: 'live',
        channelDisplayName: 'Salafi Channel',
        telegramSlug: 'salafi_channel',
        scholarName: 'Scholar Name',
        scholarSlug: 'scholar-slug',
      });
      expect(result.deletedIds).toEqual(['old-id-1']);
      expect(typeof result.fetchedAt).toBe('string');
      expect(repo.findActive).toHaveBeenCalledWith(
        new Date('2024-01-01T00:00:00.000Z'),
      );
      expect(repo.findDeletedFromActive).toHaveBeenCalled();
    });

    it('should not fetch deletedIds and return empty array when no since date', async () => {
      repo.findActive.mockResolvedValue([mockSessionRecord] as any);

      const result = await service.getActive();

      expect(result.deletedIds).toEqual([]);
      expect(repo.findDeletedFromActive).not.toHaveBeenCalled();
      expect(repo.findActive).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming sessions delta', async () => {
      repo.findUpcoming.mockResolvedValue([mockSessionRecord] as any);
      repo.findDeletedFromUpcoming.mockResolvedValue([]);

      const result = await service.getUpcoming('2024-01-01T00:00:00.000Z');

      expect(result.sessions).toHaveLength(1);
      expect(result.deletedIds).toEqual([]);
      expect(repo.findUpcoming).toHaveBeenCalledWith(
        new Date('2024-01-01T00:00:00.000Z'),
      );
    });

    it('should not fetch deletedIds when no since date', async () => {
      repo.findUpcoming.mockResolvedValue([] as any);

      const result = await service.getUpcoming();

      expect(result.deletedIds).toEqual([]);
      expect(repo.findDeletedFromUpcoming).not.toHaveBeenCalled();
    });
  });

  describe('getEnded', () => {
    it('should return ended sessions delta', async () => {
      repo.findEnded.mockResolvedValue([mockSessionRecord] as any);
      repo.findDeletedFromEnded.mockResolvedValue(['ended-old']);

      const result = await service.getEnded('2024-01-01T00:00:00.000Z');

      expect(result.sessions).toHaveLength(1);
      expect(result.deletedIds).toEqual(['ended-old']);
      expect(repo.findEnded).toHaveBeenCalledWith(
        new Date('2024-01-01T00:00:00.000Z'),
      );
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status when session exists', async () => {
      const updated = { ...mockSessionRecord, status: 'ended' as const };
      repo.findSessionById.mockResolvedValue(mockSessionRecord as any);
      repo.updateSessionStatus.mockResolvedValue(updated as any);

      const result = await service.updateSessionStatus('session-1', 'ended');

      expect(result).toBeDefined();
      expect(repo.findSessionById).toHaveBeenCalledWith('session-1');
      expect(repo.updateSessionStatus).toHaveBeenCalledWith(
        'session-1',
        'ended',
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      repo.findSessionById.mockResolvedValue(null);

      await expect(
        service.updateSessionStatus('unknown', 'ended'),
      ).rejects.toThrow(
        new NotFoundException('Live session "unknown" not found'),
      );
      expect(repo.updateSessionStatus).not.toHaveBeenCalled();
    });
  });

  describe('getChannels', () => {
    it('should return all channels mapped to DTOs', async () => {
      repo.findChannels.mockResolvedValue([mockChannelRecord] as any);

      const result = await service.getChannels();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'channel-1',
        displayName: 'Salafi Channel',
        telegramSlug: 'salafi_channel',
        isActive: true,
        scholarName: 'Scholar Name',
        scholarSlug: 'scholar-slug',
      });
    });
  });

  describe('getChannelBySlug', () => {
    it('should return channel DTO when found', async () => {
      repo.findChannelBySlug.mockResolvedValue(mockChannelRecord as any);

      const result = await service.getChannelBySlug('salafi_channel');

      expect(result.id).toBe('channel-1');
      expect(repo.findChannelBySlug).toHaveBeenCalledWith('salafi_channel');
    });

    it('should throw NotFoundException when channel not found', async () => {
      repo.findChannelBySlug.mockResolvedValue(null);

      await expect(service.getChannelBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateChannel', () => {
    it('should throw NotFoundException when channel not found', async () => {
      repo.findChannelById.mockResolvedValue(null);

      await expect(
        service.updateChannel('unknown', { displayName: 'New Name' }),
      ).rejects.toThrow(
        new NotFoundException('Livestream channel "unknown" not found'),
      );
      expect(repo.updateChannel).not.toHaveBeenCalled();
    });

    it('should update and return mapped channel when found', async () => {
      const updated = { ...mockChannelRecord, displayName: 'Updated Name' };
      repo.findChannelById.mockResolvedValue(mockChannelRecord as any);
      repo.updateChannel.mockResolvedValue(updated as any);

      const result = await service.updateChannel('channel-1', {
        displayName: 'Updated Name',
      });

      expect(result.displayName).toBe('Updated Name');
      expect(repo.updateChannel).toHaveBeenCalledWith(
        'channel-1',
        expect.objectContaining({ displayName: 'Updated Name' }),
      );
    });
  });

  describe('createSession', () => {
    it('should create and return mapped session', async () => {
      repo.createSession.mockResolvedValue(mockSessionRecord as any);

      const result = await service.createSession({
        channelId: 'channel-1',
        title: 'Test Session',
      });

      expect(result.id).toBe('session-1');
      expect(repo.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: { connect: { id: 'channel-1' } },
          title: 'Test Session',
        }),
      );
    });
  });

  describe('updateSession', () => {
    it('should throw NotFoundException when session not found', async () => {
      repo.findSessionById.mockResolvedValue(null);

      await expect(
        service.updateSession('unknown', { title: 'New Title' }),
      ).rejects.toThrow(
        new NotFoundException('Live session "unknown" not found'),
      );
      expect(repo.updateSession).not.toHaveBeenCalled();
    });

    it('should update and return mapped session when found', async () => {
      const updated = { ...mockSessionRecord, title: 'Updated Title' };
      repo.findSessionById.mockResolvedValue(mockSessionRecord as any);
      repo.updateSession.mockResolvedValue(updated as any);

      const result = await service.updateSession('session-1', {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
      expect(repo.updateSession).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ title: 'Updated Title' }),
      );
    });
  });

  describe('getSessionPublic', () => {
    it('should return mapped session DTO when found', async () => {
      repo.findSessionPublicById.mockResolvedValue(mockSessionRecord as any);

      const result = await service.getSessionPublic('session-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('session-1');
      expect(repo.findSessionPublicById).toHaveBeenCalledWith('session-1');
    });

    it('should return null when session not found', async () => {
      repo.findSessionPublicById.mockResolvedValue(null);

      const result = await service.getSessionPublic('unknown');

      expect(result).toBeNull();
      expect(repo.findSessionPublicById).toHaveBeenCalledWith('unknown');
    });
  });
});
