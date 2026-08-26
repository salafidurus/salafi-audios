import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import ErrorPage from "./error";

describe("shell-unavailable error boundary", () => {
  it("renders an independent branded recovery page", () => {
    render(<ErrorPage error={new Error("public shell failed")} reset={() => {}} />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("Salafi Durus")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  });

  it("reloads through the browser when the reload action is activated", () => {
    const reload = vi.spyOn(window.location, "reload").mockImplementation(() => {});

    render(<ErrorPage error={new Error("public shell failed")} reset={() => {}} />);
    screen.getByRole("button", { name: "Reload page" }).click();

    expect(reload).toHaveBeenCalledTimes(1);
    reload.mockRestore();
  });
});
