import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

describe("interaction primitives", () => {
  it("renders buttons with semantic state and a touch target", () => {
    render(
      <Button disabled data-testid="button">
        Save
      </Button>,
    );

    const button = screen.getByTestId("button");
    expect(button).toHaveRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveClass("min-h-12");
  });

  it("associates field labels, descriptions, and errors with controls", () => {
    render(
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-describedby="email-description email-error" aria-invalid="true" />
        <FieldDescription id="email-description">Use your account email.</FieldDescription>
        <FieldError id="email-error">Email is required.</FieldError>
      </Field>,
    );

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Use your account email.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required.");
  });

  it("keeps select state controlled and exposes expanded state", () => {
    render(
      <Select defaultValue="english">
        <SelectTrigger aria-label="Language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="english">English</SelectItem>
          <SelectItem value="arabic">Arabic</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Language" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveClass("min-h-12");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Arabic" })).toBeInTheDocument();
  });

  it("opens and closes a controlled dialog through accessible controls", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open settings</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Update your preferences.</DialogDescription>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Settings");
    expect(screen.getByText("Update your preferences.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
