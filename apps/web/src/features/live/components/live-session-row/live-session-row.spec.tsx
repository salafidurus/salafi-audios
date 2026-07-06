import React from "react";
import { render, screen } from "@testing-library/react";
import { LiveSessionRow, formatScheduledTime } from "./live-session-row";
import type { LiveSessionPublicDto, LiveSessionDto } from "@sd/core-contracts";

const mockLiveSession: LiveSessionPublicDto = {
  id: "session-1",
  status: "live",
  channelDisplayName: "Live Channel",
  title: "Awesome Live Session",
  scholarName: "Scholar Name",
  telegramSlug: "telegram-slug",
  updatedAt: "2026-07-04T00:00:00.000Z",
};

const mockScheduledSession: LiveSessionPublicDto = {
  id: "session-2",
  status: "scheduled",
  channelDisplayName: "Live Channel",
  title: "Upcoming Session",
  scholarName: "Scholar Name",
  scheduledAt: "2026-07-04T10:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
};

const mockEndedSession: LiveSessionDto = {
  id: "session-3",
  status: "ended",
  title: "Past Session",
  scholarId: "scholar-1",
  scholarName: "Scholar Name",
  recordingLectureId: "lecture-123",
};

describe("LiveSessionRow", () => {
  it("renders active session with LIVE badge and telegram link opening in a new tab", () => {
    render(<LiveSessionRow session={mockLiveSession} />);

    expect(screen.getByTestId("live-badge")).toBeInTheDocument();
    expect(screen.getByText("Awesome Live Session")).toBeInTheDocument();
    expect(screen.getByText("Scholar Name · Live Channel")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://t.me/telegram-slug");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveClass("listRow");
  });

  it("renders scheduled session with formatted date/time badge", () => {
    render(<LiveSessionRow session={mockScheduledSession} />);

    expect(screen.getByTestId("scheduled-badge")).toBeInTheDocument();
    expect(screen.getByText(formatScheduledTime("2026-07-04T10:00:00.000Z"))).toBeInTheDocument();
    expect(screen.getByText("Upcoming Session")).toBeInTheDocument();
  });

  it("renders ended session with recording available badge", () => {
    render(<LiveSessionRow session={mockEndedSession} />);

    expect(screen.getByTestId("recording-badge")).toBeInTheDocument();
    expect(screen.getByText("Recording Available")).toBeInTheDocument();
    expect(screen.getByText("Past Session")).toBeInTheDocument();
  });
});
