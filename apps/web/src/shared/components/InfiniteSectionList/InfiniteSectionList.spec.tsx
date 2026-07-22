import { describe, it, expect, beforeAll, vi } from "bun:test";
import { render, screen } from "@testing-library/react";
import { InfiniteSectionList, type SectionData } from "./InfiniteSectionList";

// Mock IntersectionObserver
beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

describe("InfiniteSectionList", () => {
  type Section = { id: string; title: string };
  type Item = { id: string; name: string };

  const mockSections: SectionData<Section, Item>[] = [
    {
      key: "sec-1",
      section: { id: "sec-1", title: "Section 1" },
      data: [
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "Item 2" },
      ],
    },
    {
      key: "sec-2",
      section: { id: "sec-2", title: "Section 2" },
      data: [{ id: "item-3", name: "Item 3" }],
    },
  ];

  it("renders sections and items correctly", () => {
    render(
      <InfiniteSectionList
        sections={mockSections}
        hasMore={false}
        onLoadMore={vi.fn()}
        renderSectionHeader={(sec) => <h2>{sec.title}</h2>}
        renderItem={(item) => <span>{item.name}</span>}
        itemKeyExtractor={(item) => item.id}
      />,
    );

    expect(screen.getByText("Section 1")).toBeTruthy();
    expect(screen.getByText("Section 2")).toBeTruthy();
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.getByText("Item 2")).toBeTruthy();
    expect(screen.getByText("Item 3")).toBeTruthy();
  });

  it("renders empty message when no items", () => {
    render(
      <InfiniteSectionList
        sections={[]}
        hasMore={false}
        onLoadMore={vi.fn()}
        renderSectionHeader={(sec: Section) => <h2>{sec.title}</h2>}
        renderItem={(item: Item) => <span>{item.name}</span>}
        itemKeyExtractor={(item: Item) => item.id}
        emptyMessage="Nothing here"
      />,
    );

    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("populates sectionRefs", () => {
    const sectionRefs = { current: {} as Record<string, HTMLElement | null> };
    render(
      <InfiniteSectionList
        sections={mockSections}
        hasMore={false}
        onLoadMore={vi.fn()}
        renderSectionHeader={(sec) => <h2>{sec.title}</h2>}
        renderItem={(item) => <span>{item.name}</span>}
        itemKeyExtractor={(item) => item.id}
        sectionRefs={sectionRefs}
      />,
    );

    expect(sectionRefs.current["sec-1"]).toBeDefined();
    expect(sectionRefs.current["sec-2"]).toBeDefined();
  });
});
