import { usePlaybackStore, type Track } from "@sd/domain-audio";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import { audioService } from "../audio-service";
import { MiniPlayer } from "./mini-player";

const savedState = { value: false };
const markSaved = vi.fn();
const markUnsaved = vi.fn();

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

vi.mock("@sd/domain-content", () => ({
  useIsSaved: () => savedState.value,
  markSaved,
  markUnsaved,
}));

vi.mock("../audio-service", () => ({
  audioService: {
    pause: vi.fn(),
    resume: vi.fn(),
    seek: vi.fn(),
    setSpeed: vi.fn(),
    skipToPrevious: vi.fn(),
    skipToNext: vi.fn(),
    stop: vi.fn(),
  },
}));

const track: Track = {
  id: "track-1",
  slug: "lecture-one",
  title: "Lecture One",
  artist: "Scholar One",
  url: "https://stream.test/lecture-one.mp3",
  durationSeconds: 600,
  artworkUrl: "https://cdn.test/lecture-one.jpg",
};

beforeEach(() => {
  vi.clearAllMocks();
  savedState.value = false;
  usePlaybackStore.getState().actions.stop();
});

describe("MiniPlayer", () => {
  it("renders nothing without an active track", () => {
    const { container } = render(<MiniPlayer />);

    expect(container.firstChild).toBeNull();
  });

  it("renders track identity, artwork, progress, and the primary playback action", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(track);
    usePlaybackStore.getState().actions.setDuration(600);
    usePlaybackStore.getState().actions.setPosition(150);

    render(<MiniPlayer />);

    expect(screen.getByRole("region", { name: "Audio player" })).toBeInTheDocument();
    expect(screen.getAllByText("Lecture One")).not.toHaveLength(0);
    expect(screen.getAllByText("Scholar One")).not.toHaveLength(0);
    expect(screen.getAllByRole("img", { name: "Lecture One" })[0]).toHaveAttribute(
      "src",
      track.artworkUrl,
    );
    expect(screen.getAllByRole("button", { name: "Play" })[0]).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Audio progress" })).toHaveValue("25");
  });

  it("opens the expanded player and exposes secondary controls", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(track);

    render(<MiniPlayer />);

    const expandButton = screen.getByRole("button", { name: "Expand player" });
    expect(expandButton).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mini-player-expanded")).toHaveAttribute("hidden");

    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute("aria-expanded", "true");
    const expanded = screen.getByRole("region", { name: "Expanded player" });
    expect(within(expanded).getByRole("button", { name: "Previous track" })).toBeVisible();
    expect(
      within(expanded).getByRole("button", { name: "Skip backward 30 seconds" }),
    ).toBeVisible();
    expect(within(expanded).getByRole("button", { name: "Playback Speed" })).toBeVisible();
    expect(within(expanded).getByRole("button", { name: "Bookmark" })).toBeVisible();
  });

  it("delegates playback controls and seeking to the audio service", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(track);
    usePlaybackStore.getState().actions.setDuration(600);
    usePlaybackStore.getState().actions.setPosition(150);
    usePlaybackStore.getState().actions.setQueueState([track, { ...track, id: "track-2" }], 0);

    render(<MiniPlayer />);
    fireEvent.click(screen.getAllByRole("button", { name: "Play" })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    const expanded = screen.getByRole("region", { name: "Expanded player" });
    fireEvent.click(within(expanded).getByRole("button", { name: "Previous track" }));
    fireEvent.click(within(expanded).getByRole("button", { name: "Next track" }));
    fireEvent.click(within(expanded).getByRole("button", { name: "Skip backward 30 seconds" }));
    fireEvent.click(within(expanded).getByRole("button", { name: "Skip forward 30 seconds" }));
    fireEvent.change(within(expanded).getByRole("slider", { name: "Audio progress" }), {
      target: { value: "50" },
    });
    fireEvent.click(within(expanded).getByRole("button", { name: "Playback Speed" }));
    fireEvent.click(within(expanded).getByRole("button", { name: "Close player" }));

    expect(audioService.resume).toHaveBeenCalled();
    expect(audioService.skipToPrevious).toHaveBeenCalled();
    expect(audioService.skipToNext).toHaveBeenCalled();
    expect(audioService.seek).toHaveBeenCalledWith(120);
    expect(audioService.seek).toHaveBeenCalledWith(300);
    expect(audioService.setSpeed).toHaveBeenCalledWith(1.25);
    expect(audioService.stop).toHaveBeenCalled();
  });

  it("disables the primary action while loading and toggles saved state by id and slug", () => {
    usePlaybackStore.getState().actions.setCurrentTrack(track);
    usePlaybackStore.getState().actions.setStatus("loading");

    render(<MiniPlayer />);

    expect(screen.getAllByRole("button", { name: "Play" })[0]).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    const expanded = screen.getByRole("region", { name: "Expanded player" });
    fireEvent.click(within(expanded).getByRole("button", { name: "Bookmark" }));
    expect(markSaved).toHaveBeenCalledWith(track.id, track.slug);

    savedState.value = true;
    fireEvent.click(screen.getByRole("button", { name: "Collapse player" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    const expandedAfterSave = screen.getByRole("region", { name: "Expanded player" });
    fireEvent.click(within(expandedAfterSave).getByRole("button", { name: "Remove from saved" }));
    expect(markUnsaved).toHaveBeenCalledWith(track.id, track.slug);
  });
});
