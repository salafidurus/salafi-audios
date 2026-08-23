import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { LibraryTabs } from "./library-tabs";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

describe("LibraryTabs", () => {
  it("exposes distinct route-backed tabs with the active tab selected", () => {
    render(<LibraryTabs activeTab="saved" />);

    expect(screen.getByRole("tab", { name: "Started" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("tab", { name: "Saved" })).toHaveAttribute("href", "/library/saved");
    expect(screen.getByRole("tab", { name: "Completed" })).toHaveAttribute(
      "href",
      "/library/completed",
    );
    expect(screen.getByRole("tab", { name: "Saved" })).toHaveAttribute("aria-selected", "true");
  });
});
