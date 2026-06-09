import React from "react";
import renderer, { act } from "react-test-renderer";
import { CollectionSheet } from "./CollectionSheet";

jest.mock("@/features/admin-scholars/api/admin-scholars.api", () => ({
  createCollection: jest.fn(),
  updateCollection: jest.fn(),
}));

describe("CollectionSheet", () => {
  it("renders create form when no collection is provided", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <CollectionSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("New Collection");
    expect(rendered).toContain("Title");
  });

  it("renders Edit Collection title when collection is provided", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <CollectionSheet
          isOpen={true}
          scholarId="s1"
          collection={{ id: "col1", title: "My Collection", status: "draft" }}
          onClose={() => {}}
          onSaved={() => {}}
        />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("Edit Collection");
  });

  it("renders nothing when closed", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <CollectionSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
