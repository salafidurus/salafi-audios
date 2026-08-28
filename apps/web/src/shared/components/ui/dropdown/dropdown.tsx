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

export interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  error?: boolean | string;
  direction?: "up" | "down";
  className?: string;
}

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

export interface DropdownTriggerProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  testId?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

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
