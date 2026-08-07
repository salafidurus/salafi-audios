import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders message as the headline when no title is provided", async () => {
    await render(<EmptyState message="No items yet." />);
    expect(screen.getByText("No items yet.")).toBeTruthy();
  });

  it("prefers title over message", async () => {
    await render(<EmptyState message="Fallback text" title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
    expect(screen.queryByText("Fallback text")).toBeNull();
  });

  it("renders the description when provided", async () => {
    await render(<EmptyState message="Nothing here" description="Try again later." />);
    expect(screen.getByText("Try again later.")).toBeTruthy();
  });

  it("renders the icon inside the icon circle", async () => {
    await render(<EmptyState message="Nothing here" icon={<View testID="empty-icon" />} />);
    expect(screen.getByTestId("empty-icon")).toBeTruthy();
  });

  it("does not render an icon circle without an icon", async () => {
    await render(<EmptyState message="Nothing here" />);
    expect(screen.queryByTestId("empty-icon")).toBeNull();
  });

  it("renders an action button and fires onAction when pressed", async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState message="Nothing here" actionLabel="Browse lectures" onAction={onAction} />,
    );

    await fireEvent.press(screen.getByText("Browse lectures"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("keeps the retry button working via onRetry", async () => {
    const onRetry = jest.fn();
    await render(<EmptyState message="Something broke" onRetry={onRetry} retryLabel="Try Again" />);

    await fireEvent.press(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
