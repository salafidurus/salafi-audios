import { render, screen, fireEvent } from "@testing-library/react-native";
import type { LectureDetailDto } from "@sd/core-contracts";
import { LecturePlayButtonNative } from "./LecturePlayButton";

jest.mock("@sd/domain-playback", () => ({
  usePlayback: jest.fn(),
}));

jest.mock("../../../../shared/components/Button/Button", () => ({
  ButtonMobileNative: ({ label, onPress }: { label: string; onPress: () => void }) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  },
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

describe("LecturePlayButtonNative", () => {
  it("returns null when there is no primaryAudioAsset", () => {
    const { toJSON } = render(<LecturePlayButtonNative lecture={baseLecture} />);
    expect(toJSON()).toBeNull();
  });

  it("renders play button when primaryAudioAsset exists", () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      primaryAudioAsset: { id: "asset-1", url: "https://example.com/audio.mp3" },
    };
    render(<LecturePlayButtonNative lecture={lecture} />);
    expect(screen.getByText("▶ Play Lecture")).toBeTruthy();
  });

  it("calls play() with correct Track shape when pressed", () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      durationSeconds: 3600,
      primaryAudioAsset: {
        id: "asset-1",
        url: "https://example.com/audio.mp3",
        durationSeconds: 1800,
      },
    };
    render(<LecturePlayButtonNative lecture={lecture} />);
    fireEvent.press(screen.getByText("▶ Play Lecture"));
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
