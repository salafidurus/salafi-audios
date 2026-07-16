import { vi, type Mocked } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { SessionsRepository } from './sessions.repo';
import { LiveService } from '../live/live.service';

const mockLiveSession = {
  id: 's-1',
  status: 'live' as const,
  startedAt: new Date(),
};
const mockScheduledSession = {
  id: 's-2',
  status: 'scheduled' as const,
  startedAt: null,
};

describe('SessionsService', () => {
  let service: SessionsService;
  let repo: Mocked<SessionsRepository>;
  let liveService: Mocked<LiveService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SessionsRepository,
          useValue: {
            findLatestLiveSession: vi.fn<any>(),
            createSession: vi.fn<any>(),
            updateStatus: vi.fn<any>(),
            findByChannelAndStatus: vi.fn<any>(),
          } satisfies Partial<Mocked<SessionsRepository>>,
        },
        {
          provide: LiveService,
          useValue: {
            getSessionPublic: vi.fn<any>(),
            emitSessionUpdate: vi.fn<any>(),
          } satisfies Partial<Mocked<LiveService>>,
        },
      ],
    }).compile();

    service = module.get(SessionsService);
    repo = module.get(SessionsRepository) as Mocked<SessionsRepository>;
    liveService = module.get(LiveService) as Mocked<LiveService>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('upsertFromTelegram', () => {
    it('creates a new live session when none exists and isLive=true', async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);
      repo.createSession.mockResolvedValue({ id: 's-create' } as any);
      liveService.getSessionPublic.mockResolvedValue({ id: 's-create' } as any);

      await service.upsertFromTelegram('channel-1', {
        isLive: true,
        title: 'Live Now',
      });

      expect(repo.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: 'channel-1',
          status: 'live',
          title: 'Live Now',
          startedAt: expect.any(Date),
        }),
      );
      expect(repo.updateStatus).not.toHaveBeenCalled();
      expect(liveService.getSessionPublic).toHaveBeenCalledWith('s-create');
      expect(liveService.emitSessionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 's-create' }),
      );
    });

    it('updates viewerCount on existing live session when isLive=true', async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockLiveSession);
      repo.updateStatus.mockResolvedValue({ id: 's-1' } as any);
      liveService.getSessionPublic.mockResolvedValue({ id: 's-1' } as any);

      await service.upsertFromTelegram('channel-1', {
        isLive: true,
        viewerCount: 42,
      });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        's-1',
        'live',
        expect.objectContaining({ viewerCount: 42 }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
      expect(liveService.getSessionPublic).toHaveBeenCalledWith('s-1');
      expect(liveService.emitSessionUpdate).toHaveBeenCalled();
    });

    it('transitions scheduled session to live when isLive=true', async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockScheduledSession);
      repo.updateStatus.mockResolvedValue({ id: 's-2' } as any);
      liveService.getSessionPublic.mockResolvedValue({ id: 's-2' } as any);

      await service.upsertFromTelegram('channel-1', { isLive: true });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        's-2',
        'live',
        expect.objectContaining({ startedAt: expect.any(Date) }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
      expect(liveService.getSessionPublic).toHaveBeenCalledWith('s-2');
      expect(liveService.emitSessionUpdate).toHaveBeenCalled();
    });

    it('marks live session as ended when isLive=false', async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockLiveSession);
      repo.updateStatus.mockResolvedValue({ id: 's-1' } as any);
      liveService.getSessionPublic.mockResolvedValue({ id: 's-1' } as any);

      await service.upsertFromTelegram('channel-1', { isLive: false });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        's-1',
        'ended',
        expect.objectContaining({ endedAt: expect.any(Date) }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
      expect(liveService.getSessionPublic).toHaveBeenCalledWith('s-1');
      expect(liveService.emitSessionUpdate).toHaveBeenCalled();
    });

    it('does nothing when isLive=false and no active session', async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);

      await service.upsertFromTelegram('channel-1', { isLive: false });

      expect(repo.createSession).not.toHaveBeenCalled();
      expect(repo.updateStatus).not.toHaveBeenCalled();
      expect(liveService.getSessionPublic).not.toHaveBeenCalled();
      expect(liveService.emitSessionUpdate).not.toHaveBeenCalled();
    });

    it('does nothing when isLive=false and session is already ended', async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);

      await service.upsertFromTelegram('channel-1', { isLive: false });

      expect(repo.createSession).not.toHaveBeenCalled();
      expect(repo.updateStatus).not.toHaveBeenCalled();
      expect(liveService.getSessionPublic).not.toHaveBeenCalled();
      expect(liveService.emitSessionUpdate).not.toHaveBeenCalled();
    });
  });
});
