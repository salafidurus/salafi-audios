import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { MobileBottomNav } from "./mobile-bottom-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("MobileBottomNav", () => {
  it("renders mobile navigation items", () => {
    render(<MobileBottomNav />);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Search")).toBeTruthy();
    expect(screen.getByText("Explore")).toBeTruthy();
    expect(screen.getByText("Scholars")).toBeTruthy();
    expect(screen.getByText("Library")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });
});
