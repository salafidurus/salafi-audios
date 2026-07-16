import { vi, type Mock } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { FeedListRow } from "./feed-list-row";
import { useAudio, useProgressStore } from "@sd/domain-audio";
import { audioService } from "@/features/audio";
import styles from "./feed-list-row.module.css";

vi.mock("@sd/domain-audio", async (importOriginal) => {
  const original = await importOriginal<typeof import("@sd/domain-audio")>();
  return {
    ...original,
    useAudio: vi.fn<any>(),
  };
});

vi.mock("@/features/audio", () => ({
  audioService: {
    playListing: vi.fn<any>(),
    pause: vi.fn<any>(),
    resume: vi.fn<any>(),
  },
}));

vi.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: () => false,
}));

const baseItem: FeedContentItemDto = {
  kind: "single",
  id: "lec-1",
  title: "Importance of Sunnah",
  slug: "importance-of-sunnah",
  scholarName: "Ibn Uthaymeen",
  scholarSlug: "ibn-uthaymeen",
  thumbnailUrl: null,
  durationSeconds: 1800,
  publishedAt: "2026-07-04T00:00:00.000Z",
};

const progressInitialState = useProgressStore.getState();

describe("FeedListRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAudio as Mock).mockReturnValue({ isPlaying: false, currentTrack: null });
    useProgressStore.setState(progressInitialState, true);
  });

  it("renders item metadata successfully (fallback initial avatar)", () => {
    render(<FeedListRow item={baseItem} />);
    expect(screen.getByText("Importance of Sunnah")).toBeInTheDocument();
    expect(screen.getByText("Ibn Uthaymeen")).toBeInTheDocument();
    expect(screen.getByText("I")).toBeInTheDocument(); // initial
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
  });

  it("renders thumbnailUrl image when present", () => {
    const itemWithThumb = {
      ...baseItem,
      thumbnailUrl: "/images/uthaymeen.jpg",
    };
    render(<FeedListRow item={itemWithThumb} />);
    const img = screen.getByRole("img", { name: "Ibn Uthaymeen" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("uthaymeen.jpg");
  });

  it("calls audioService.playLecture on play button click", () => {
    render(<FeedListRow item={baseItem} />);
    const playBtn = screen.getByRole("button", { name: "Play lecture" });
    fireEvent.click(playBtn);

    const expectedTrack = {
      id: "lec-1",
      title: "Importance of Sunnah",
      artist: "Ibn Uthaymeen",
      url: "",
      durationSeconds: 1800,
      artworkUrl: undefined,
      seriesId: null,
      seriesTitle: null,
    };
    expect(audioService.playListing).toHaveBeenCalledWith(expectedTrack, [expectedTrack]);
  });

  it("calls audioService.pause on active playing track play button click", () => {
    (useAudio as Mock).mockReturnValue({
      isPlaying: true,
      currentTrack: { id: "lec-1" },
    });
    render(<FeedListRow item={baseItem} />);
    const pauseBtn = screen.getByRole("button", { name: "Pause lecture" });
    fireEvent.click(pauseBtn);
    expect(audioService.pause).toHaveBeenCalled();
  });

  it("calls audioService.resume on active paused track play button click", () => {
    (useAudio as Mock).mockReturnValue({
      isPlaying: false,
      currentTrack: { id: "lec-1" },
    });
    render(<FeedListRow item={baseItem} />);
    const playBtn = screen.getByRole("button", { name: "Play lecture" });
    fireEvent.click(playBtn);
    expect(audioService.resume).toHaveBeenCalled();
  });

  it("calls addSaved when bookmark button clicked and not saved", () => {
    render(<FeedListRow item={baseItem} />);
    const saveBtn = screen.getByRole("button", { name: "Save lecture" });
    fireEvent.click(saveBtn);
    expect(useProgressStore.getState().actions.isSaved("lec-1")).toBe(true);
  });

  it("calls removeSaved when bookmark button clicked and already saved", () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    render(<FeedListRow item={baseItem} />);
    const unsaveBtn = screen.getByRole("button", { name: "Remove from saved" });
    fireEvent.click(unsaveBtn);
    expect(useProgressStore.getState().actions.isSaved("lec-1")).toBe(false);
  });

  it("triggers onPress prop when row is clicked", () => {
    const onPressMock = vi.fn<any>();
    const { container } = render(<FeedListRow item={baseItem} onPress={onPressMock} />);
    const row = container.querySelector(`.${styles.row}`);
    expect(row).toBeInTheDocument();
    fireEvent.click(row!);
    expect(onPressMock).toHaveBeenCalled();
  });

  it("renders progress bar at calculated width when progress is in range", () => {
    useProgressStore.getState().actions.setProgress("lec-1", 450, 1800); // 25%
    const { container } = render(<FeedListRow item={baseItem} />);
    const progressBar = container.querySelector(`.${styles.progressBar}`);
    expect(progressBar).toBeInTheDocument();
    expect((progressBar as HTMLElement).style.width).toBe("25%");
  });
});
