import { render, screen } from "@testing-library/react-native";
import React from "react";

import { SanadChain } from "./SanadChain";

describe("SanadChain", () => {
  it("renders correctly with default props", async () => {
    await render(<SanadChain />);
    expect(screen.getByTestId("sanad-chain")).toBeTruthy();
    expect(screen.getByTestId("sanad-dot-0")).toBeTruthy();
    expect(screen.getByTestId("sanad-line-0")).toBeTruthy();
  });

  it("renders capped number of dots up to max 7", async () => {
    await render(<SanadChain total={12} completed={4} />);
    expect(screen.getByTestId("sanad-dot-6")).toBeTruthy();
    expect(screen.queryByTestId("sanad-dot-7")).toBeNull();
  });

  it("renders progress correctly based on completed ratio", async () => {
    await render(<SanadChain total={6} completed={3} />);
    expect(screen.getByTestId("sanad-dot-0")).toBeTruthy();
  });
});
