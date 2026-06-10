import React from "react";
import renderer, { act } from "react-test-renderer";
import { BulkActionBar } from "./BulkActionBar";

describe("BulkActionBar", () => {
  it("returns null when no items are selected", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <BulkActionBar selectedCount={0} onPublish={() => {}} onArchive={() => {}} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it("shows count and action buttons when items are selected", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <BulkActionBar selectedCount={3} onPublish={() => {}} onArchive={() => {}} />,
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("3");
    expect(rendered).toContain("selected");
    expect(rendered).toContain("Publish");
    expect(rendered).toContain("Archive");
  });
});
