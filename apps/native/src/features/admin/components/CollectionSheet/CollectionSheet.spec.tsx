import React from "react";
import { render, screen } from "@testing-library/react-native";
import { CollectionSheet } from "./CollectionSheet";

jest.mock("@/features/admin/api/admin-scholars.api", () => ({
  createCollection: jest.fn(),
  updateCollection: jest.fn(),
}));

describe("CollectionSheet", () => {
  it("renders create form when no collection is provided", async () => {
    await render(
      <CollectionSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.getByText("New Collection")).toBeTruthy();
    expect(screen.getByText("Title", { exact: false })).toBeTruthy();
  });

  it("renders Edit Collection title when collection is provided", async () => {
    await render(
      <CollectionSheet
        isOpen={true}
        scholarId="s1"
        collection={{
          id: "col1",
          title: "My Collection",
          format: "collection",
          status: "draft",
          scholarId: "s1",
          scholarName: "Scholar One",
          slug: "my-collection",
          topics: [],
          createdAt: "2026-07-04T00:00:00Z",
        }}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.getByText("Edit Collection")).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(
      <CollectionSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.toJSON()).toBeNull();
  });
});
