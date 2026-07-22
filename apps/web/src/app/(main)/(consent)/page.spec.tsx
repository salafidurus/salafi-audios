import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";
import { render } from "@testing-library/react";
import HomePage from "./page";
import { HomeScreen } from "@/features/home";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";

vi.mock("next/navigation", () => {
  const push = vi.fn();
  return {
    useRouter: () => ({ push }),
  };
});

vi.mock("@/features/home", () => ({
  HomeScreen: vi.fn(() => <div data-testid="home-screen-mock" />),
}));

describe("HomePage Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes navigation callbacks to HomeScreen and renders it using testID", () => {
    const { getByTestId } = render(<HomePage />);

    // Assert that the component was rendered using its mock testID
    expect(getByTestId("home-screen-mock")).toBeTruthy();

    const mockHomeScreen = HomeScreen as unknown as Mock<any>;
    expect(mockHomeScreen).toHaveBeenCalled();

    const props = mockHomeScreen.mock.calls[0]?.[0] as any;
    expect(props).toBeTruthy();

    const { push } = useRouter();

    // Test search callback
    props.onOpenSearch();
    expect(push).toHaveBeenCalledWith(routes.search);

    // Test continue listening callback
    props.onContinueListening("lecture-abc");
    expect(push).toHaveBeenCalledWith(routes.listings.detail("lecture-abc"));
  });
});
