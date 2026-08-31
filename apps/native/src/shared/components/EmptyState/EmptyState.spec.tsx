import { render, screen, fireEvent } from "@testing-library/react-native";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the message and retry action for a recoverable state", async () => {
    const onRetry = jest.fn();
    await render(
      <EmptyState message="Could not load lectures." variant="error" onRetry={onRetry} />,
    );

    expect(screen.getByText("Could not load lectures.")).toBeTruthy();
    await fireEvent.press(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
