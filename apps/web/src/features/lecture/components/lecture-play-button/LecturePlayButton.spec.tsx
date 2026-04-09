import { render, screen, fireEvent } from "@testing-library/react";
import type { LectureDetailDto } from "@sd/core-contracts";
import { LecturePlayButton } from "./LecturePlayButton";

jest.mock("@sd/domain-playback", () => ({
  usePlayback: jest.fn(),
}));

import { usePlayback } from "@sd/domain-playback";

const mockPlay = jest.fn();

beforeEach(() => {
  mockPlay.mockClear();
  (usePlayback as jest.Mock).mockReturnValue({ play: mockPlay });
});

const baseLecture: LectureDetailDto = {
  id: "lec-1",
  slug: "test-lecture",
  title: "Test Lecture",
  scholar: { id: "sch-1", slug: "scholar", name: "Ibn Baz" },
  topics: [],
  primaryAudioAsset: null,
  seriesContext: null,
};

describe("LecturePlayButton", () => {
  it("returns null when there is no primaryAudioAsset", () => {
    const { container } = render(<LecturePlayButton lecture={baseLecture} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders play button when primaryAudioAsset exists", () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      primaryAudioAsset: { id: "asset-1", url: "https://example.com/audio.mp3" },
    };
    render(<LecturePlayButton lecture={lecture} />);
    expect(screen.getByText("▶ Play Lecture")).toBeInTheDocument();
  });

  it("calls play() with correct Track shape when clicked", () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      durationSeconds: 3600,
      primaryAudioAsset: {
        id: "asset-1",
        url: "https://example.com/audio.mp3",
        durationSeconds: 1800,
      },
    };
    render(<LecturePlayButton lecture={lecture} />);
    fireEvent.click(screen.getByText("▶ Play Lecture"));
    expect(mockPlay).toHaveBeenCalledWith({
      id: "asset-1",
      lectureId: "lec-1",
      title: "Test Lecture",
      scholarName: "Ibn Baz",
      audioUrl: "https://example.com/audio.mp3",
      durationSeconds: 1800,
      artworkUrl: undefined,
    });
  });
});
