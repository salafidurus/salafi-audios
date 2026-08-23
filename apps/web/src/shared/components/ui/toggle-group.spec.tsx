import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  it("exposes single-selection state through accessible radio semantics", () => {
    render(
      <ToggleGroup type="single" defaultValue="all" aria-label="Topics">
        <ToggleGroupItem value="all" variant="outline" size="sm">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="fiqh" variant="outline" size="sm">
          Fiqh
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const all = screen.getByRole("radio", { name: "All" });
    const fiqh = screen.getByRole("radio", { name: "Fiqh" });

    expect(all).toHaveAttribute("aria-checked", "true");
    expect(fiqh).toHaveAttribute("aria-checked", "false");

    fireEvent.click(fiqh);

    expect(all).toHaveAttribute("aria-checked", "false");
    expect(fiqh).toHaveAttribute("aria-checked", "true");
  });
});
