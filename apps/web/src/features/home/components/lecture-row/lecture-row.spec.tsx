import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { LectureRow } from "./lecture-row";

describe("LectureRow", () => {
  it("keeps row activation separate from the progress accordion", () => {
    const onClick = vi.fn();

    render(
      <LectureRow
        title="Foundations of Faith"
        category="Aqeedah"
        scholarName="A Scholar"
        duration="20 min"
        totalLessons={2}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Foundations of Faith/ }));
    expect(onClick).toHaveBeenCalledTimes(1);

    const progressTrigger = screen
      .getAllByRole("button", { name: /0 of 2 lessons completed/i })
      .find((button) => button.getAttribute("data-slot") === "accordion-trigger");
    expect(progressTrigger).toBeTruthy();
    fireEvent.click(progressTrigger!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
