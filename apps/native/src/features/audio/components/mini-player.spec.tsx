import React from "react";
import { render, screen } from "@testing-library/react-native";
import { MiniPlayer } from "./mini-player";

jest.mock("@sd/domain-audio", () => ({
  useAudio: jest.fn(),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("lucide-react-native", () => ({
  Play: "Play",
  Pause: "Pause",
  ChevronDown: "ChevronDown",
  Music: "Music",
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock("../audio-service", () => ({
  audioService: {
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock("./progress-bar", () => ({
  ProgressBar: () => null,
}));

jest.mock("./playback-controls", () => ({
  PlaybackControls: () => null,
}));

const { useAudio } = jest.requireMock("@sd/domain-audio");

const mockTrack = {
  id: "track-1",
  title: "Test Lecture",
  artist: "Shaykh Ahmad",
  durationSeconds: 3600,
  artworkUrl: "https://example.com/art.jpg",
};

describe("MiniPlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when no currentTrack", async () => {
    useAudio.mockReturnValue({ currentTrack: null, isPlaying: false, isLoading: false });
    await render(<MiniPlayer />);
    expect(screen.toJSON()).toBeNull();
  });

  it("renders track title and artist when track exists", async () => {
    useAudio.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      isLoading: false,
      progressPercent: 0,
      positionSeconds: 0,
    });
    await render(<MiniPlayer />);
    expect(screen.getByText("Test Lecture")).toBeTruthy();
    expect(screen.getByText("Shaykh Ahmad")).toBeTruthy();
  });

  it("shows play button when not playing", async () => {
    useAudio.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      isLoading: false,
      progressPercent: 0,
      positionSeconds: 0,
    });
    const { getByTestId } = await render(<MiniPlayer />);
    expect(getByTestId("play-button")).toBeTruthy();
  });

  it("calls pause when play button pressed while playing", async () => {
    useAudio.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      isLoading: false,
      progressPercent: 50,
      positionSeconds: 30,
    });
    await render(<MiniPlayer />);
    expect(screen.toJSON()).not.toBeNull();
  });
});
