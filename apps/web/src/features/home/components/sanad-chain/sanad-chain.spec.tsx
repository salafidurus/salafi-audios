import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";
import React from "react";

import { SanadChain } from "./sanad-chain";

describe("SanadChain", () => {
  it("shows progress and expands its lesson summary", () => {
    render(<SanadChain total={4} completed={2} />);

    expect(screen.getByRole("button", { name: /2 of 4 lessons completed/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /2 of 4 lessons completed/i }));

    expect(
      screen.getByText("2 of 4 lessons completed", {
        selector: '[data-slot="card-content"]',
      }),
    ).toBeTruthy();
  });
});
