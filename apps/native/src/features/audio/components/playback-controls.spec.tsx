import { usePlaybackStore, type Track } from "@sd/domain-audio";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { PlaybackControls } from "./playback-controls";

jest.mock("react-native-unistyles", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { lightNativeTheme } = require("@/core/styles/theme");
  return {
    StyleSheet: {
      create: (styles: unknown) =>
        typeof styles === "function" ? styles(lightNativeTheme) : styles,
    },
    useUnistyles: () => ({ theme: lightNativeTheme }),
  };
});

jest.mock("@sd/domain-audio", () => {
  const actual = jest.requireActual("@sd/domain-audio");
  return {
    ...actual,
    useQueue: jest.fn(),
  };
});

jest.mock("../audio-service", () => ({
  audioService: {
    pause: jest.fn(),
    resume: jest.fn(),
    seek: jest.fn(),
    setSpeed: jest.fn(),
    skipToPrevious: jest.fn(),
    skipToNext: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { audioService } = require("../audio-service");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useQueue } = require("@sd/domain-audio");

const trackA: Track = { id: "a", title: "A", artist: "Scholar", url: "", durationSeconds: 100 };
const trackB: Track = { id: "b", title: "B", artist: "Scholar", url: "", durationSeconds: 100 };

beforeEach(() => {
  jest.clearAllMocks();
  usePlaybackStore.getState().actions.stop();
  useQueue.mockReturnValue({ hasNext: false, hasPrevious: false });
});

describe("PlaybackControls", () => {
  it("renders nothing when there is no current track", async () => {
    const { toJSON } = await render(<PlaybackControls />);
    expect(toJSON()).toBeNull();
  });

  it("calls skipToPrevious when Previous is pressed", async () => {
    usePlaybackStore.getState().actions.setCurrentTrack(trackA);
    useQueue.mockReturnValue({ hasNext: false, hasPrevious: true });

    await render(<PlaybackControls />);
    await fireEvent.press(screen.getByLabelText("Previous track"));

    expect(audioService.skipToPrevious).toHaveBeenCalled();
  });

  it("does not call skipToNext when there is no next track in the queue", async () => {
    usePlaybackStore.getState().actions.setCurrentTrack(trackA);

    await render(<PlaybackControls />);
    await fireEvent.press(screen.getByLabelText("Next track"));

    expect(audioService.skipToNext).not.toHaveBeenCalled();
  });

  it("calls skipToNext when a next track exists in the queue", async () => {
    usePlaybackStore.getState().actions.setCurrentTrack(trackA);
    usePlaybackStore.getState().actions.setQueueState([trackA, trackB], 0);
    useQueue.mockReturnValue({ hasNext: true, hasPrevious: false });

    await render(<PlaybackControls />);
    await fireEvent.press(screen.getByLabelText("Next track"));

    expect(audioService.skipToNext).toHaveBeenCalled();
  });
});
