import React from "react";
import renderer, { act } from "react-test-renderer";
import { SeriesSheet } from "./SeriesSheet";

jest.mock("@/features/admin-scholars/api/admin-scholars.api", () => ({
  createSeries: jest.fn(),
  updateSeries: jest.fn(),
}));

describe("SeriesSheet", () => {
  it("renders create form when no series is provided", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SeriesSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("New Series");
    expect(rendered).toContain("Title");
  });

  it("renders nothing when closed", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SeriesSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
