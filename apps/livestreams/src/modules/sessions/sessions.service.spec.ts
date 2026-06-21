import { vi, type Mocked, type MockInstance } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from "@nestjs/testing";
import { SessionsService } from "./sessions.service";
import { SessionsRepository } from "./sessions.repo";
import { LiveConfigService } from "../../shared/config/config.service";

const mockLiveSession = { id: "s-1", status: "live" as const, startedAt: new Date() };
const mockScheduledSession = { id: "s-2", status: "scheduled" as const, startedAt: null };

describe("SessionsService", () => {
  let service: SessionsService;
  let repo: Mocked<SessionsRepository>;
  let fetchMock: MockInstance;

  beforeEach(async () => {
    fetchMock = vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(""),
      } as Response),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SessionsRepository,
          useValue: {
            findLatestLiveSession: vi.fn(),
            createSession: vi.fn(),
            updateStatus: vi.fn(),
            findByChannelAndStatus: vi.fn(),
          } satisfies Partial<Mocked<SessionsRepository>>,
        },
        {
          provide: LiveConfigService,
          useValue: {
            apiUrl: "http://test-api",
            livestreamSecret: "test-secret",
          },
        },
      ],
    }).compile();

    service = module.get(SessionsService);
    repo = module.get(SessionsRepository) as Mocked<SessionsRepository>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("upsertFromTelegram", () => {
    it("creates a new live session when none exists and isLive=true", async () => {
      repo.findLatestLiveSession.mockResolvedValue(null);
      repo.createSession.mockResolvedValue({ id: "s-create" } as any);

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
      expect(fetchMock).toHaveBeenCalledWith(
        "http://test-api/live/sessions/sync-notify",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-secret",
          }),
          body: JSON.stringify({ sessionId: "s-create" }),
        }),
      );
    });

    it("updates viewerCount on existing live session when isLive=true", async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockLiveSession);
      repo.updateStatus.mockResolvedValue({ id: "s-1" } as any);

      await service.upsertFromTelegram("channel-1", { isLive: true, viewerCount: 42 });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "s-1",
        "live",
        expect.objectContaining({ viewerCount: 42 }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "http://test-api/live/sessions/sync-notify",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ sessionId: "s-1" }),
        }),
      );
    });

    it("transitions scheduled session to live when isLive=true", async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockScheduledSession);
      repo.updateStatus.mockResolvedValue({ id: "s-2" } as any);

      await service.upsertFromTelegram("channel-1", { isLive: true });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "s-2",
        "live",
        expect.objectContaining({ startedAt: expect.any(Date) }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "http://test-api/live/sessions/sync-notify",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ sessionId: "s-2" }),
        }),
      );
    });

    it("marks live session as ended when isLive=false", async () => {
      repo.findLatestLiveSession.mockResolvedValue(mockLiveSession);
      repo.updateStatus.mockResolvedValue({ id: "s-1" } as any);

      await service.upsertFromTelegram("channel-1", { isLive: false });

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "s-1",
        "ended",
        expect.objectContaining({ endedAt: expect.any(Date) }),
      );
      expect(repo.createSession).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "http://test-api/live/sessions/sync-notify",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ sessionId: "s-1" }),
        }),
      );
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
