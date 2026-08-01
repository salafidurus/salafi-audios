import type { ListingContentItemDto } from "@sd/core-contracts";

import { usePlaybackStore } from "@sd/domain-audio";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { audioService } from "@/features/audio";

import { ContentListItem } from "./ContentListItem";

vi.mock("@/features/audio", () => ({
  audioService: {
    playListing: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  },
}));

const item: ListingContentItemDto = {
  id: "lesson-1",
  slug: "lesson-1",
  title: "Lesson 1",
  primaryAudioAsset: { id: "a1", url: "https://s/lesson-1.mp3" },
};

beforeEach(() => {
  vi.clearAllMocks();
  usePlaybackStore.getState().actions.stop();
});

describe("ContentListItem", () => {
  it("tags the track with moduleId/moduleTitle, not seriesId/seriesTitle, when rendered inside a Collection", () => {
    render(
      <ContentListItem
        item={item}
        scholarName="Ibn Baz"
        moduleId="module-1"
        moduleTitle="Module 1"
        collectionId="collection-1"
      />,
    );

    fireEvent.click(screen.getByText("Play"));

    const [track] = (audioService.playListing as any).mock.calls[0];
    expect(track.moduleId).toBe("module-1");
    expect(track.moduleTitle).toBe("Module 1");
    expect(track.collectionId).toBe("collection-1");
    expect(track.seriesId).toBeNull();
  });

  it("tags the track with seriesId/seriesTitle when rendered inside a Series", () => {
    render(
      <ContentListItem
        item={item}
        scholarName="Ibn Baz"
        seriesId="series-1"
        seriesTitle="Series 1"
      />,
    );

    fireEvent.click(screen.getByText("Play"));

    const [track] = (audioService.playListing as any).mock.calls[0];
    expect(track.seriesId).toBe("series-1");
    expect(track.seriesTitle).toBe("Series 1");
    expect(track.moduleId).toBeNull();
  });
});
