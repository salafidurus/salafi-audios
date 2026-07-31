import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { lightNativeTheme } from "@/core/styles/theme";

import { ConfirmDialog } from "./ConfirmDialog.android";

describe("ConfirmDialog (Android)", () => {
  it("renders nothing when not visible", async () => {
    await render(
      <ConfirmDialog
        visible={false}
        onDismiss={() => {}}
        onConfirm={() => {}}
        title="Sign Out?"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />,
    );
    expect(screen.queryByText("Sign Out?")).toBeNull();
  });

  it("renders the title and message when visible", async () => {
    await render(
      <ConfirmDialog
        visible={true}
        onDismiss={() => {}}
        onConfirm={() => {}}
        title="Sign Out?"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />,
    );
    expect(screen.getByText("Sign Out?")).toBeTruthy();
    expect(screen.getByText("Are you sure you want to sign out?")).toBeTruthy();
  });

  it("calls onConfirm when the confirm action is pressed", async () => {
    const onConfirm = jest.fn();
    await render(
      <ConfirmDialog
        visible={true}
        onDismiss={() => {}}
        onConfirm={onConfirm}
        title="Sign Out?"
        message="Are you sure?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />,
    );
    await fireEvent.press(screen.getByText("Sign Out"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when the cancel action is pressed", async () => {
    const onDismiss = jest.fn();
    await render(
      <ConfirmDialog
        visible={true}
        onDismiss={onDismiss}
        onConfirm={() => {}}
        title="Sign Out?"
        message="Are you sure?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />,
    );
    await fireEvent.press(screen.getByText("Cancel"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("themes the dialog container, title, and text colors", async () => {
    await render(
      <ConfirmDialog
        visible={true}
        onDismiss={() => {}}
        onConfirm={() => {}}
        title="Sign Out?"
        message="Are you sure?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />,
    );

    expect(screen.getByTestId("alert-dialog").props.colors).toEqual({
      containerColor: lightNativeTheme.colors.surface.elevated,
      titleContentColor: lightNativeTheme.colors.content.strong,
      textContentColor: lightNativeTheme.colors.content.default,
    });
  });
});
