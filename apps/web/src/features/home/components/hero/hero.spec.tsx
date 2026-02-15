import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

function mockIntersectionObserver() {
  class IO {
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  // @ts-expect-error - test shim
  global.IntersectionObserver = IO;
}

describe("Hero", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockIntersectionObserver();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders message as H1 and entity/scholar under it (series)", () => {
    render(
      <Hero
        items={[
          {
            kind: "series",
            entityId: "ser-1",
            entitySlug: "kitab-ut-tawhid",
            headline: "Tawhid First",
            title: "Kitab ut-Tawhid",
            lessonCount: 12,
            presentedBy: "Shaykh A",
            presentedBySlug: "shaykh-a",
          },
        ]}
      />,
    );

    expect(screen.getByText("Featured series")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Kitab ut-Tawhid" })).toBeInTheDocument();
    expect(screen.getByText("Tawhid First")).toBeInTheDocument();
    expect(screen.getByText("Shaykh A")).toBeInTheDocument();

    expect(screen.queryByText("Begin your learning journey")).not.toBeInTheDocument();
  });

  it("uses the right featured label for lectures", () => {
    render(
      <Hero
        items={[
          {
            kind: "lecture",
            entityId: "lec-1",
            entitySlug: "kitab-ut-tawhid-01",
            headline: "Tawhid First",
            title: "Kitab ut-Tawhid 01",
            lessonCount: 1,
            presentedBy: "Shaykh A",
            presentedBySlug: "shaykh-a",
          },
        ]}
      />,
    );

    expect(screen.getByText("Featured lecture")).toBeInTheDocument();
  });
});
