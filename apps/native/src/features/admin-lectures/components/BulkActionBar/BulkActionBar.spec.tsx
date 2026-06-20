import React from "react";
import { render, screen } from "@testing-library/react-native";
import { BulkActionBar } from "./BulkActionBar";

describe("BulkActionBar", () => {
  it("returns null when no items are selected", async () => {
    await render(<BulkActionBar selectedCount={0} onPublish={() => {}} onArchive={() => {}} />);
    expect(screen.toJSON()).toBeNull();
  });

  it("shows count and action buttons when items are selected", async () => {
    await render(<BulkActionBar selectedCount={3} onPublish={() => {}} onArchive={() => {}} />);
    expect(screen.getByText("3 selected")).toBeTruthy();
    expect(screen.getByText("Publish")).toBeTruthy();
    expect(screen.getByText("Archive")).toBeTruthy();
  });
});
