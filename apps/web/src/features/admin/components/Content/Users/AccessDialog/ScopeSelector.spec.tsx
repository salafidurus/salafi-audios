import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { ScopeSelector } from "./ScopeSelector";

describe("ScopeSelector", () => {
  it("filters options and commits a selected option", async () => {
    let selectedIds: string[] = [];

    const { rerender } = render(
      <ScopeSelector
        title="Allowed Scholars"
        placeholder="Search scholars"
        options={[
          { id: "scholar-a", name: "Scholar A" },
          { id: "scholar-b", name: "Scholar B" },
        ]}
        selectedIds={selectedIds}
        onChange={(next) => {
          selectedIds = next;
          rerender(
            <ScopeSelector
              title="Allowed Scholars"
              placeholder="Search scholars"
              options={[
                { id: "scholar-a", name: "Scholar A" },
                { id: "scholar-b", name: "Scholar B" },
              ]}
              selectedIds={selectedIds}
              onChange={(nextSelection) => {
                selectedIds = nextSelection;
              }}
            />,
          );
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Scholar A" } });
    const option = await screen.findByText("Scholar A");
    fireEvent.click(option);

    expect(selectedIds).toEqual(["scholar-a"]);
    expect(screen.getByRole("button", { name: "Remove Scholar A" })).toBeVisible();
  });
});
