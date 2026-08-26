import type { ListingContentItemDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { render, screen, fireEvent } from "@testing-library/react-native";

import { audioService } from "@/features/audio";

import { LessonRow } from "./lesson-row";

jest.mock("lucide-react-native", () => ({
  Play: "Play",
  Pause: "Pause",
}));

jest.mock("@/features/audio", () => ({
  audioService: {
    playListing: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

const mockDownloadButton = jest.fn((_props: unknown) => null);
const mockDownloadProgress = jest.fn((_props: unknown) => null);

jest.mock("@/features/downloads/components/download-button/download-button", () => ({
  DownloadButton: (props: unknown) => {
    mockDownloadButton(props);
    return null;
  },
}));

jest.mock("@/features/downloads/components/download-progress/download-progress", () => ({
  DownloadProgress: (props: unknown) => {
    mockDownloadProgress(props);
    return null;
  },
}));

const mockUseAudio = jest.fn(() => ({ isPlaying: false, currentTrack: null as Track | null }));
const mockUseListingProgress = jest.fn(() => ({ progressPercent: 0, isCompleted: false }));

jest.mock("@sd/domain-audio", () => ({
  useAudio: () => mockUseAudio(),
  useListingProgress: () => mockUseListingProgress(),
}));

const item: ListingContentItemDto = {
  id: "lesson-1",
  slug: "lesson-1",
  title: "Lesson One",
  durationSeconds: 600,
  primaryAudioAsset: { id: "a1", url: "https://s/lesson-1.mp3" },
};

const track: Track = {
  id: "lesson-1",
  slug: "lesson-1",
  title: "Lesson One",
  artist: "Ibn Baz",
  url: "https://s/lesson-1.mp3",
  durationSeconds: 600,
  seriesId: null,
  seriesTitle: null,
};

describe("LessonRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAudio.mockReturnValue({ isPlaying: false, currentTrack: null });
    mockUseListingProgress.mockReturnValue({ progressPercent: 0, isCompleted: false });
  });

  it("renders the lesson title and duration", async () => {
    await render(<LessonRow item={item} queue={[track]} />);
    expect(screen.getByText("Lesson One")).toBeTruthy();
    expect(screen.getByText("10 min")).toBeTruthy();
  });

  it("plays the matching track from the queue on press when nothing is playing", async () => {
    await render(<LessonRow item={item} queue={[track]} />);
    await fireEvent.press(screen.getByText("Lesson One"));
    expect(audioService.playListing).toHaveBeenCalledWith(track, [track]);
  });

  it("pauses when this lesson is currently playing", async () => {
    mockUseAudio.mockReturnValue({ isPlaying: true, currentTrack: track });
    await render(<LessonRow item={item} queue={[track]} />);
    await fireEvent.press(screen.getByText("Lesson One"));
    expect(audioService.pause).toHaveBeenCalled();
  });

  it("resumes when this lesson is current but paused", async () => {
    mockUseAudio.mockReturnValue({ isPlaying: false, currentTrack: track });
    await render(<LessonRow item={item} queue={[track]} />);
    await fireEvent.press(screen.getByText("Lesson One"));
    expect(audioService.resume).toHaveBeenCalled();
  });

  it("reports its layout offset via onLayout", async () => {
    const onLayout = jest.fn();
    await render(<LessonRow item={item} queue={[track]} onLayout={onLayout} />);
    fireEvent(screen.getByTestId("lesson-row-lesson-1"), "layout", {
      nativeEvent: { layout: { y: 120, x: 0, width: 100, height: 50 } },
    });
    expect(onLayout).toHaveBeenCalledWith("lesson-1", 120);
  });

  it("wires the lesson's id and audio url through to DownloadButton and DownloadProgress", async () => {
    await render(<LessonRow item={item} queue={[track]} />);

    expect(mockDownloadButton).toHaveBeenCalledWith(
      expect.objectContaining({ listingSlug: "lesson-1", audioUrl: "https://s/lesson-1.mp3" }),
    );
    expect(mockDownloadProgress).toHaveBeenCalledWith(
      expect.objectContaining({ listingSlug: "lesson-1" }),
    );
  });
});
