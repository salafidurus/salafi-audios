import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { MyLibraryTabs } from "./my-library-tabs";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

describe("MyLibraryTabs", () => {
  it("exposes distinct route-backed tabs with the active tab selected", () => {
    render(<MyLibraryTabs activeTab="saved" />);

    expect(screen.getByRole("tab", { name: "Started" }).getAttribute("href")).toBe("/my-library");
    expect(screen.getByRole("tab", { name: "Saved" }).getAttribute("href")).toBe(
      "/my-library?tab=saved",
    );
    expect(screen.getByRole("tab", { name: "Completed" }).getAttribute("href")).toBe(
      "/my-library?tab=completed",
    );
    expect(screen.getByRole("tab", { name: "Saved" }).getAttribute("aria-selected")).toBe("true");
  });
});
