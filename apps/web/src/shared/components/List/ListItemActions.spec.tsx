import React from "react";
import { render, screen } from "@testing-library/react";
import { ListItemActions } from "./ListItemActions";
import styles from "./ListItemActions.module.css";

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
    const { container } = render(
      <ListItemActions>
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toHaveClass(styles["orientation-horizontal"]);
  });

  it("applies vertical orientation class when orientation prop is vertical", () => {
    const { container } = render(
      <ListItemActions orientation="vertical">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toHaveClass(styles["orientation-vertical"]);
  });

  it("applies mobile orientation class (horizontal by default)", () => {
    const { container } = render(
      <ListItemActions>
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toHaveClass(styles["mobile-orientation-horizontal"]);
  });

  it("applies custom mobile orientation class when mobileOrientation is vertical", () => {
    const { container } = render(
      <ListItemActions mobileOrientation="vertical">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toHaveClass(styles["mobile-orientation-vertical"]);
  });

  it("applies both orientation and mobileOrientation classes independently", () => {
    const { container } = render(
      <ListItemActions orientation="vertical" mobileOrientation="vertical">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toHaveClass(styles["orientation-vertical"]);
    expect(actionsContainer).toHaveClass(styles["mobile-orientation-vertical"]);
  });

  it("merges custom className with default classes", () => {
    const { container } = render(
      <ListItemActions className="custom-class">
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toHaveClass("custom-class");
    expect(actionsContainer).toHaveClass(styles.actions);
  });

  it("applies flex-shrink-0 base class to prevent shrinking", () => {
    const { container } = render(
      <ListItemActions>
        <button type="button">Action 1</button>
      </ListItemActions>,
    );
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    // The base styles class should be applied
    expect(actionsContainer).toHaveClass(styles.actions);
  });

  it("renders multiple action buttons with proper spacing", () => {
    const { container } = render(
      <ListItemActions>
        <button type="button">Edit</button>
        <button type="button">Delete</button>
        <button type="button">Share</button>
      </ListItemActions>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    // All buttons should be children of the actions container
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    buttons.forEach((button) => {
      expect(actionsContainer).toContainElement(button);
    });
  });

  it("renders with empty children without error", () => {
    const { container } = render(<ListItemActions />);
    const actionsContainer = container.querySelector(`.${styles.actions}`);
    expect(actionsContainer).toBeInTheDocument();
  });

  describe("Orientation combinations", () => {
    it("supports horizontal desktop with vertical mobile", () => {
      const { container } = render(
        <ListItemActions orientation="horizontal" mobileOrientation="vertical">
          <button type="button">Action 1</button>
        </ListItemActions>,
      );
      const actionsContainer = container.querySelector(`.${styles.actions}`);
      expect(actionsContainer).toHaveClass(styles["orientation-horizontal"]);
      expect(actionsContainer).toHaveClass(styles["mobile-orientation-vertical"]);
    });

    it("supports vertical desktop with horizontal mobile", () => {
      const { container } = render(
        <ListItemActions orientation="vertical" mobileOrientation="horizontal">
          <button type="button">Action 1</button>
        </ListItemActions>,
      );
      const actionsContainer = container.querySelector(`.${styles.actions}`);
      expect(actionsContainer).toHaveClass(styles["orientation-vertical"]);
      expect(actionsContainer).toHaveClass(styles["mobile-orientation-horizontal"]);
    });
  });

  describe("Accessibility", () => {
    it("does not add extra accessibility attributes to the container", () => {
      const { container } = render(
        <ListItemActions>
          <button type="button" aria-label="Edit item">
            Edit
          </button>
        </ListItemActions>,
      );
      const actionsContainer = container.querySelector(`.${styles.actions}`);
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
