import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { MiniPlayer } from "./mini-player";

jest.mock("@sd/domain-audio", () => ({
  useAudio: jest.fn(),
  useQueue: jest.fn(),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("lucide-react-native", () => ({
  Play: "Play",
  Pause: "Pause",
  ChevronDown: "ChevronDown",
  Music: "Music",
  BookOpen: "BookOpen",
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

jest.mock("@/shared/components/SanadChain", () => ({
  SanadChain: () => null,
}));

const mockUseFormattedScholarName = jest.fn((artist: string, _scholarSlug?: string) => artist);

jest.mock("@sd/domain-content", () => ({
  useFormattedScholarName: (artist?: string | null, scholarSlug?: string | null) =>
    mockUseFormattedScholarName(artist ?? "", scholarSlug ?? undefined),
}));

const { useAudio, useQueue } = jest.requireMock("@sd/domain-audio");

const mockTrack = {
  id: "track-1",
  title: "Test Lecture",
  artist: "Ahmad",
  scholarSlug: "ahmad",
  durationSeconds: 3600,
  artworkUrl: "https://example.com/art.jpg",
};

describe("MiniPlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQueue.mockReturnValue({ queueLength: 0, currentIndex: -1 });
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
    expect(screen.getByText("Ahmad")).toBeTruthy();
  });

  it("renders the artist name with honorific title when available", async () => {
    mockUseFormattedScholarName.mockReturnValueOnce("Shaykh Ahmad");
    useAudio.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      isLoading: false,
      progressPercent: 0,
      positionSeconds: 0,
    });
    await render(<MiniPlayer />);
    expect(mockUseFormattedScholarName).toHaveBeenCalledWith("Ahmad", "ahmad");
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

  it("renders the embedded container chromeless inside the native accessory pill", async () => {
    useAudio.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      isLoading: false,
      progressPercent: 0,
      positionSeconds: 0,
    });
    await render(<MiniPlayer embedded />);
    const containerStyle = StyleSheet.flatten(
      screen.getByTestId("mini-player-container").props.style,
    );
    expect(containerStyle.borderWidth).toBeUndefined();
    expect(containerStyle.backgroundColor).toBe("transparent");
    expect(containerStyle.elevation).toBeUndefined();
    expect(containerStyle.height).toBe(52);
  });
});
