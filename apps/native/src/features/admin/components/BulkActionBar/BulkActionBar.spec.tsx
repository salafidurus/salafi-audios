import { render, screen } from "@testing-library/react-native";
import React from "react";

import { BulkActionBar } from "./BulkActionBar";

describe("BulkActionBar", () => {
  it("returns null when no items are selected", async () => {
    await render(
      <BulkActionBar
        selectedCount={0}
        onPublish={() => {}}
        onArchive={() => {}}
        canPublish
        canArchive
      />,
    );
    expect(screen.toJSON()).toBeNull();
  });

  it("shows count and both action buttons when both are allowed", async () => {
    await render(
      <BulkActionBar
        selectedCount={3}
        onPublish={() => {}}
        onArchive={() => {}}
        canPublish
        canArchive
      />,
    );
    expect(screen.getByText("3 selected")).toBeTruthy();
    expect(screen.getByText("Publish")).toBeTruthy();
    expect(screen.getByText("Archive")).toBeTruthy();
  });

  it("hides the Publish button when canPublish is false", async () => {
    await render(
      <BulkActionBar
        selectedCount={3}
        onPublish={() => {}}
        onArchive={() => {}}
        canPublish={false}
        canArchive
      />,
    );
    expect(screen.queryByText("Publish")).toBeNull();
    expect(screen.getByText("Archive")).toBeTruthy();
  });

  it("hides the Archive button when canArchive is false", async () => {
    await render(
      <BulkActionBar
        selectedCount={3}
        onPublish={() => {}}
        onArchive={() => {}}
        canPublish
        canArchive={false}
      />,
    );
    expect(screen.getByText("Publish")).toBeTruthy();
    expect(screen.queryByText("Archive")).toBeNull();
  });

  it("returns null when neither action is allowed, even with a selection", async () => {
    await render(
      <BulkActionBar
        selectedCount={3}
        onPublish={() => {}}
        onArchive={() => {}}
        canPublish={false}
        canArchive={false}
      />,
    );
    expect(screen.toJSON()).toBeNull();
  });
});
