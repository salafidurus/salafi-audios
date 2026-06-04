import { Test, TestingModule } from "@nestjs/testing";
import { SessionsService } from "./sessions.service";
import { SessionsRepository } from "./sessions.repo";

const mockLiveSession = { id: "s-1", status: "live" as const, startedAt: new Date() };
const mockScheduledSession = { id: "s-2", status: "scheduled" as const, startedAt: null };

describe("SessionsService", () => {
  let service: SessionsService;
  let repo: jest.Mocked<SessionsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SessionsRepository,
          useValue: {
            findLatestLiveSession: jest.fn(),
            createSession: jest.fn(),
            updateStatus: jest.fn(),
            findByChannelAndStatus: jest.fn(),
          } satisfies Partial<jest.Mocked<SessionsRepository>>,
        },
      ],
    }).compile();

    service = module.get(SessionsService);
    repo = module.get(SessionsRepository) as jest.Mocked<SessionsRepository>;
  });

  describe("upsertFromTelegram", () => {
    it("creates a new live session when none exists and isLive=true", async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);
      repo.createSession.mockResolvedValue({} as Awaited<ReturnType<typeof repo.createSession>>);

      await service.upsertFromTelegram("channel-1", { isLive: true, title: "Live Now" });

      expect(repo.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: "channel-1",
          status: "live",
          title: "Live Now",
          startedAt: expect.any(Date),
        }),
      );
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it("updates viewerCount on existing live session when isLive=true", async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockLiveSession);
      repo.updateStatus.mockResolvedValue({} as Awaited<ReturnType<typeof repo.updateStatus>>);

      await service.upsertFromTelegram("channel-1", { isLive: true, viewerCount: 42 });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "s-1",
        "live",
        expect.objectContaining({ viewerCount: 42 }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
    });

    it("transitions scheduled session to live when isLive=true", async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockScheduledSession);
      repo.updateStatus.mockResolvedValue({} as Awaited<ReturnType<typeof repo.updateStatus>>);

      await service.upsertFromTelegram("channel-1", { isLive: true });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "s-2",
        "live",
        expect.objectContaining({ startedAt: expect.any(Date) }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
    });

    it("marks live session as ended when isLive=false", async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockLiveSession);
      repo.updateStatus.mockResolvedValue({} as Awaited<ReturnType<typeof repo.updateStatus>>);

      await service.upsertFromTelegram("channel-1", { isLive: false });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "s-1",
        "ended",
        expect.objectContaining({ endedAt: expect.any(Date) }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
    });

    it("does nothing when isLive=false and no active session", async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);

      await service.upsertFromTelegram("channel-1", { isLive: false });

      expect(repo.createSession).not.toHaveBeenCalled();
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it("does nothing when isLive=false and session is already ended", async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);

      await service.upsertFromTelegram("channel-1", { isLive: false });

      expect(repo.createSession).not.toHaveBeenCalled();
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });
});
