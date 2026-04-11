import React from "react";
import renderer, { act } from "react-test-renderer";
import type { LectureDetailDto } from "@sd/core-contracts";
import { LecturePlayButton } from "./LecturePlayButton";
import { usePlayback } from "@sd/domain-playback";

jest.mock("@sd/domain-playback", () => ({ usePlayback: jest.fn() }));

jest.mock("../../../../shared/components/Button/Button", () => ({
  Button: ({ label, onPress }: { label: string; onPress: () => void }) => {
    const React = require("react");
    return React.createElement("View", { testID: label, onPress }, label);
  },
}));

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
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LecturePlayButton lecture={baseLecture} />);
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it("renders play button when primaryAudioAsset exists", () => {
    const lecture: LectureDetailDto = {
      ...baseLecture,
      primaryAudioAsset: { id: "asset-1", url: "https://example.com/audio.mp3" },
    };
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LecturePlayButton lecture={lecture} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("▶ Play Lecture");
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
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<LecturePlayButton lecture={lecture} />);
    });
    const pressable = tree!.root.find(
      (node: { props: { onPress?: unknown } }) => typeof node.props.onPress === "function",
    );
    act(() => {
      pressable.props.onPress();
    });
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
