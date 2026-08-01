import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "bun:test";
import React from "react";

import { ListItem } from "./ListItem";

describe("ListItem", () => {
  it("forwards the id prop to the rendered element", () => {
    render(
      <ListItem id="content-item-lesson-1">
        <span>Lesson content</span>
      </ListItem>,
    );

    expect(screen.getByText("Lesson content").closest("#content-item-lesson-1")).not.toBeNull();
  });

  it("renders without an id when none is provided", () => {
    render(
      <ListItem>
        <span>Other content</span>
      </ListItem>,
    );

    expect(screen.getByText("Other content").parentElement?.id).toBe("");
  });

  it("sets data-highlighted when highlighted is true", () => {
    render(
      <ListItem highlighted>
        <span>Highlighted content</span>
      </ListItem>,
    );

    expect(screen.getByText("Highlighted content").parentElement?.dataset.highlighted).toBe("true");
  });

  it("omits data-highlighted by default", () => {
    render(
      <ListItem>
        <span>Plain content</span>
      </ListItem>,
    );

    expect(screen.getByText("Plain content").parentElement?.dataset.highlighted).toBeUndefined();
  });
});
