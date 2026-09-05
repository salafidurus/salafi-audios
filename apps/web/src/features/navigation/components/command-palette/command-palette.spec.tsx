import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import { CommandPalette } from "./command-palette";

const mockPush = vi.fn();
const mockUseSearchCatalog = vi.fn();
const mockUseTopicsList = vi.fn();
const mockUseScholarSearch = vi.fn();

vi.mock("@sd/domain-search", () => ({
  useSearchCatalog: mockUseSearchCatalog,
  useTopicsList: mockUseTopicsList,
}));

vi.mock("@sd/domain-content", () => ({
  useScholarSearch: mockUseScholarSearch,
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, options?: { count?: number }) =>
      (fallback || _key).replace("{{count}}", String(options?.count ?? "")),
    i18n: { language: "en", dir: () => "ltr" },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchCatalog.mockReturnValue({ data: undefined, isLoading: false } as never);
    mockUseTopicsList.mockReturnValue({ data: [], isLoading: false } as never);
    mockUseScholarSearch.mockReturnValue({ data: undefined, isLoading: false } as never);
  });

  it("opens from the pointer trigger and routes catalog results without account or admin actions", async () => {
    mockUseSearchCatalog.mockReturnValue({
      data: {
        collections: [
          {
            id: "listing-1",
            slug: "foundations-of-faith",
            title: "Foundations of Faith",
            scholarName: "Ibn Baz",
            scholarSlug: "ibn-baz",
            lectureCount: 8,
            durationSeconds: 5400,
          },
        ],
        series: [],
        singles: [],
      },
      isLoading: false,
    } as never);
    mockUseTopicsList.mockReturnValue({
      data: [{ id: "topic-1", slug: "aqeedah", name: { ar: "العقيدة", en: "Aqeedah" } }],
      isLoading: false,
    } as never);
    mockUseScholarSearch.mockReturnValue({
      data: {
        scholars: [
          {
            id: "scholar-1",
            slug: "ibn-baz",
            name: "Ibn Baz",
            lectureCount: 10,
          },
        ],
      },
      isLoading: false,
    } as never);

    render(<CommandPalette />);

    fireEvent.click(screen.getByRole("button", { name: "Search catalog" }));
    expect(screen.getByRole("dialog", { name: "Search catalog" })).toBeInTheDocument();

    const input = screen.getByRole("combobox", { name: "Search catalog" });
    fireEvent.change(input, { target: { value: "ibn" } });

    expect(await screen.findByRole("option", { name: /Foundations of Faith/ })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Ibn Baz.*10 listings.*Scholar/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Foundations of Faith.*1hr 30m.*Listing/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /Foundations of Faith/ }));
    expect(mockPush).toHaveBeenCalledWith("/listings/foundations-of-faith");
  });

  it("supports keyboard opening and selecting a topic destination", async () => {
    mockUseTopicsList.mockReturnValue({
      data: [{ id: "topic-1", slug: "aqeedah", name: { ar: "العقيدة", en: "Aqeedah" } }],
      isLoading: false,
    } as never);

    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    const input = screen.getByRole("combobox", { name: "Search catalog" });
    fireEvent.change(input, { target: { value: "aqeedah" } });
    const topic = await screen.findByRole("option", { name: /Aqeedah.*Topic/ });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/search?topic=aqeedah"));
    expect(topic).not.toBeInTheDocument();
  });

  it("announces loading and empty states accessibly", () => {
    mockUseSearchCatalog.mockReturnValue({ data: undefined, isLoading: true } as never);
    render(<CommandPalette />);
    fireEvent.click(screen.getByRole("button", { name: "Search catalog" }));
    const input = screen.getByRole("combobox", { name: "Search catalog" });
    fireEvent.change(input, { target: { value: "missing" } });
    expect(screen.getByRole("status")).toHaveTextContent("Loading catalog");

    mockUseSearchCatalog.mockReturnValue({
      data: { collections: [], series: [], singles: [] },
      isLoading: false,
    } as never);
    fireEvent.change(input, { target: { value: "nothing" } });
    expect(screen.getByRole("status")).toHaveTextContent("No catalog results");
  });
});
