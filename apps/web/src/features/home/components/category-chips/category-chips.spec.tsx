import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";
import React from "react";

import { CategoryChips } from "./category-chips";

vi.mock("@sd/domain-search", () => ({
  useTopicsList: () => ({
    data: [
      { id: "t1", slug: "fiqh", name: { ar: "فقه", en: "Fiqh" } },
      { id: "t2", slug: "aqeedah", name: { ar: "عقيدة", en: "Aqeedah" } },
    ],
  }),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

describe("CategoryChips", () => {
  it("renders a chip per topic with a localized label", () => {
    render(<CategoryChips />);

    expect(screen.getByRole("tablist", { name: "Browse by topic" })).toBeInTheDocument();
    const chips = screen.getAllByTestId("category-chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]!.textContent).toBe("Aqeedah");
    expect(chips[1]!.textContent).toBe("Fiqh");
  });

  it("selects a topic in place instead of linking away from Home", () => {
    render(<CategoryChips />);

    const chips = screen.getAllByTestId("category-chip");
    expect(chips[0]!.getAttribute("href")).toBeNull();
    expect(chips[1]!.getAttribute("href")).toBeNull();
    expect(chips[0]!.getAttribute("role")).toBe("tab");
  });
});
