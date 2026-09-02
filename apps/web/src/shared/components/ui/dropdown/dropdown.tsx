/** Documents this module's responsibility and public boundary. */
"use client";

import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

/** Configures the controlled select primitive and its visual error state. */
export interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  /** Marks the field invalid; a string can carry an associated validation message. */
  error?: boolean | string;
  direction?: "up" | "down";
  className?: string;
}

/** Wraps the select primitive with shared validation styling and composition slots. */
export function Dropdown({
  value,
  onValueChange,
  children,
  disabled,
  error,
  className,
}: DropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <div className={className} data-invalid={error ? "true" : undefined}>
        {children}
      </div>
    </Select>
  );
}

/** Configures the button that opens a Dropdown and its accessible labeling. */
export interface DropdownTriggerProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  testId?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

/** Renders the trigger while preserving placeholder and accessibility options. */
export function DropdownTrigger({
  placeholder = "Select...",
  className,
  disabled,
  id,
  testId,
  ariaLabel,
  children,
}: DropdownTriggerProps) {
  return (
    <SelectTrigger
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
    >
      {children ?? <SelectValue placeholder={placeholder} />}
    </SelectTrigger>
  );
}

/** Renders the menu content associated with a Dropdown trigger. */
export function DropdownContent({
  children,
  className,
}: {
  children: ReactNode;
  searchable?: boolean;
  className?: string;
}) {
  return <SelectContent className={className}>{children}</SelectContent>;
}

/** Renders one selectable option in a Dropdown menu. */
export function DropdownItem({
  value,
  children,
  disabled,
}: {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <SelectItem value={value} disabled={disabled}>
      {children}
    </SelectItem>
  );
}
