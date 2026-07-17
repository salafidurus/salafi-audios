import { describe, it, expect } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ListItemActions } from "./ListItemActions";

describe("ListItemActions", () => {
  it("renders children", () => {
    render(
      <ListItemActions>
        <button type="button">Edit</button>
        <button type="button">Delete</button>
      </ListItemActions>,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("applies default orientation class (horizontal)", () => {
    render(
      <ListItemActions>
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
  });

  it("applies vertical orientation class when orientation prop is vertical", () => {
    render(
      <ListItemActions orientation="vertical">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
  });

  it("applies mobile orientation class (horizontal by default)", () => {
    render(
      <ListItemActions>
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
  });

  it("applies custom mobile orientation class when mobileOrientation is vertical", () => {
    render(
      <ListItemActions mobileOrientation="vertical">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
  });

  it("applies both orientation and mobileOrientation classes independently", () => {
    render(
      <ListItemActions orientation="vertical" mobileOrientation="vertical">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action 1" })).toBeInTheDocument();
  });

  it("merges custom className with default classes", () => {
    render(
      <ListItemActions className="custom-class">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toHaveClass("custom-class");
  });

  it("applies flex-shrink-0 base class to prevent shrinking", () => {
    render(
      <ListItemActions>
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
  });

  it("renders multiple action buttons with proper spacing", () => {
    render(
      <ListItemActions>
        <button type="button">Edit</button>
        <button type="button">Delete</button>
        <button type="button">Share</button>
      </ListItemActions>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    // All buttons should be children of the actions container
    const actionsContainer = screen.getByTestId("list-item-actions");
    buttons.forEach((button) => {
      expect(actionsContainer).toContainElement(button);
    });
  });

  it("renders with empty children without error", () => {
    render(<ListItemActions />);
    const actionsContainer = screen.getByTestId("list-item-actions");
    expect(actionsContainer).toBeInTheDocument();
  });

  describe("Orientation combinations", () => {
    it("supports horizontal desktop with vertical mobile", () => {
      render(
        <ListItemActions orientation="horizontal" mobileOrientation="vertical">
          <button type="button">Action 1</button>
        </ListItemActions>,
      );
      const actionsContainer = screen.getByTestId("list-item-actions");
      expect(actionsContainer).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action 1" })).toBeInTheDocument();
    });

    it("supports vertical desktop with horizontal mobile", () => {
      render(
        <ListItemActions orientation="vertical" mobileOrientation="horizontal">
          <button type="button">Action 1</button>
        </ListItemActions>,
      );
      const actionsContainer = screen.getByTestId("list-item-actions");
      expect(actionsContainer).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action 1" })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("does not add extra accessibility attributes to the container", () => {
      render(
        <ListItemActions>
          <button type="button" aria-label="Edit item">
            Edit
          </button>
        </ListItemActions>,
      );
      const actionsContainer = screen.getByTestId("list-item-actions");
      // Actions container should not have role or aria attributes
      // individual buttons should have their own a11y props
      expect(actionsContainer).not.toHaveAttribute("role");
    });

    it("preserves button accessibility attributes", () => {
      render(
        <ListItemActions>
          <button type="button" aria-label="Edit scholar">
            Edit
          </button>
        </ListItemActions>,
      );
      expect(screen.getByLabelText("Edit scholar")).toBeInTheDocument();
    });
  });
});
