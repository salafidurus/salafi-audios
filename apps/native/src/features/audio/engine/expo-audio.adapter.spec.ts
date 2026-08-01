import type { Track } from "@sd/domain-audio";

import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

import { ExpoAudioAdapter } from "./expo-audio.adapter";

const mockTrack: Track = {
  id: "l1",
  title: "Lecture 1",
  artist: "Scholar 1",
  artworkUrl: "https://cdn.test/art.jpg",
  url: "https://stream.test/l1.mp3",
  durationSeconds: 1800,
};

function makeMockPlayer() {
  return {
    duration: 0,
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setPlaybackRate: jest.fn(),
    remove: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    updateLockScreenMetadata: jest.fn(),
    clearLockScreenControls: jest.fn(),
  };
}

jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockedCreateAudioPlayer = jest.mocked(createAudioPlayer);
const mockedSetAudioModeAsync = jest.mocked(setAudioModeAsync);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ExpoAudioAdapter — lock screen", () => {
  it("configures the audio mode for background playback and lock-screen controls once", async () => {
    mockedCreateAudioPlayer.mockReturnValue(makeMockPlayer() as any);
    const adapter = new ExpoAudioAdapter();

    await adapter.load(mockTrack);
    await adapter.load({ ...mockTrack, id: "l2" });

    expect(mockedSetAudioModeAsync).toHaveBeenCalledTimes(1);
    expect(mockedSetAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({ shouldPlayInBackground: true, interruptionMode: "doNotMix" }),
    );
  });

  it("registers this player for lock-screen controls with track metadata on load", async () => {
    const mockPlayer = makeMockPlayer();
    mockedCreateAudioPlayer.mockReturnValue(mockPlayer as any);
    const adapter = new ExpoAudioAdapter();

    await adapter.load(mockTrack);

    expect(mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(
      true,
      { title: "Lecture 1", artist: "Scholar 1", artworkUrl: "https://cdn.test/art.jpg" },
      { showSeekBackward: true, showSeekForward: true },
    );
  });

  it("clears lock-screen controls for the previous player when loading the next track", async () => {
    const firstPlayer = makeMockPlayer();
    const secondPlayer = makeMockPlayer();
    mockedCreateAudioPlayer
      .mockReturnValueOnce(firstPlayer as any)
      .mockReturnValueOnce(secondPlayer as any);
    const adapter = new ExpoAudioAdapter();

    await adapter.load(mockTrack);
    await adapter.load({ ...mockTrack, id: "l2" });

    expect(firstPlayer.clearLockScreenControls).toHaveBeenCalled();
    expect(firstPlayer.remove).toHaveBeenCalled();
  });

  it("clears lock-screen controls on stop", async () => {
    const mockPlayer = makeMockPlayer();
    mockedCreateAudioPlayer.mockReturnValue(mockPlayer as any);
    const adapter = new ExpoAudioAdapter();

    await adapter.load(mockTrack);
    await adapter.stop();

    expect(mockPlayer.clearLockScreenControls).toHaveBeenCalled();
  });

  it("clears lock-screen controls on destroy", async () => {
    const mockPlayer = makeMockPlayer();
    mockedCreateAudioPlayer.mockReturnValue(mockPlayer as any);
    const adapter = new ExpoAudioAdapter();

    await adapter.load(mockTrack);
    await adapter.destroy();

    expect(mockPlayer.clearLockScreenControls).toHaveBeenCalled();
  });
});
