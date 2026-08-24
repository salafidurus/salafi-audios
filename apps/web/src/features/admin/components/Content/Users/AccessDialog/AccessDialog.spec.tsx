import { httpClient } from "@sd/core-contracts";
import { useAccountProfile } from "@sd/domain-account";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";

import { fetchUserAccess } from "@/features/admin/api/admin.api";

import { AccessDialog } from "./AccessDialog";

vi.mock("@/features/admin/api/admin.api", () => {
  return {
    fetchUserAccess: vi.fn(),
    replaceUserAccess: vi.fn(),
  };
});

vi.mock("@sd/domain-account", () => {
  return {
    useAccountProfile: vi.fn(),
  };
});

vi.mock("@sd/core-contracts", () => {
  const actual = require("@sd/core-contracts");
  return {
    ...actual,
    httpClient: vi.fn(),
  };
});

vi.mock("@/shared/utils/format-scholar-name", () => ({
  useFormatScholarName: () => (s: { name: string }) => s.name,
}));

describe("AccessDialog TDD Spec", () => {
  const mockSnapshot = {
    version: 1,
    isSuperadmin: false,
    roles: ["Editor"],
    scholars: [
      { slug: "scholar-a", name: "Scholar A" },
      { slug: "scholar-b", name: "Scholar B" },
    ],
    grants: [
      { target: "listing", capability: "write", scholarSlugs: [], locales: [] },
      { target: "listing", capability: "publish", scholarSlugs: [], locales: [] },
    ],
  };

  const mockScholars = {
    scholars: [
      { slug: "scholar-a", name: "Scholar A" },
      { slug: "scholar-b", name: "Scholar B" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchUserAccess as Mock<any>).mockResolvedValue(mockSnapshot);
    (httpClient as Mock<any>).mockResolvedValue(mockScholars);
    (useAccountProfile as Mock<any>).mockReturnValue({
      data: { roles: [] },
      isLoading: false,
    });
  });

  it("renders permission rows and shows sub-settings when enabled", async () => {
    render(<AccessDialog userId="u1" userName="User One" onClose={() => {}} onSaved={() => {}} />);

    // Verify target configurations rows render (wait for load to complete)
    const listingsToggle = await screen.findByLabelText("Toggle access for Listings (Duruses)");
    expect(listingsToggle).toBeVisible();
    expect(listingsToggle).toBeChecked();

    // Verify role badges render
    expect(screen.getByText("Editor")).toBeVisible();
    expect(screen.getByText("Scholars")).toBeVisible();

    // Verify expanded sub-panel contents (Actions Allowed section and capability toggles)
    expect(screen.getByText("WRITE")).toBeVisible();
    const writeToggle = screen.getByLabelText("Toggle capability write");
    expect(writeToggle).toBeChecked();

    // Check custom scope selector is rendered (Allowed Scholars section)
    expect(screen.getByText("Allowed Scholars (none means all)")).toBeVisible();
  });

  it("renders super admin row toggle if current logged-in user is a superadmin", async () => {
    (useAccountProfile as Mock<any>).mockReturnValue({
      data: { roles: ["Superadmin"] },
      isLoading: false,
    });

    render(<AccessDialog userId="u1" userName="User One" onClose={() => {}} onSaved={() => {}} />);

    // Wait for superadmin row to be visible
    const superadminToggle = await screen.findByLabelText("Toggle super admin access");
    expect(superadminToggle).toBeVisible();
    expect(superadminToggle).not.toBeChecked();

    // Toggle superadmin status
    fireEvent.click(superadminToggle);
    expect(superadminToggle).toBeChecked();
  });

  it("preserves focus on checkbox/toggle updates (no key-remount bug)", async () => {
    render(<AccessDialog userId="u1" userName="User One" onClose={() => {}} onSaved={() => {}} />);

    const writeToggle = await screen.findByLabelText("Toggle capability write");
    expect(writeToggle).toBeChecked();

    // Set focus on capability toggle switch
    writeToggle.focus();
    expect(document.activeElement).toBe(writeToggle);

    // Toggle capability (since publish is also active, this won't unmount the panel)
    fireEvent.click(writeToggle);

    // Verify focus remains on the element (React should perform in-place updates, not remount)
    expect(document.activeElement).toBe(writeToggle);
  });

  it("renders a selected scholar below the scope selector after selection", async () => {
    render(<AccessDialog userId="u1" userName="User One" onClose={() => {}} onSaved={() => {}} />);

    const scholarSelectors = await screen.findAllByLabelText("Allowed Scholars (none means all)");
    expect(scholarSelectors.length).toBeGreaterThan(0);

    const firstScholarSelector = scholarSelectors[0]!;
    const scopeTrigger = firstScholarSelector.parentElement?.querySelector("button");
    expect(scopeTrigger).not.toBeNull();
    if (!scopeTrigger) throw new Error("Expected a scholar selector trigger");
    fireEvent.click(scopeTrigger);
    fireEvent.change(firstScholarSelector, { target: { value: "Scholar A" } });
    const option = await screen.findByText("Scholar A");
    fireEvent.click(option);

    expect(screen.getAllByRole("button", { name: "Remove Scholar A" }).length).toBeGreaterThan(0);
  });
});
