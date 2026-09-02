/** Documents this module's responsibility and public boundary. */
"use client";

import React from "react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils";

/** Documents the intent and contract of this declaration. */
export interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "number" | "textarea";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  prefix?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  rows?: number;
}

const NUMERIC_PATTERN = /^\d*$/;

/** Documents the intent and contract of this declaration. */
export function InputField({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  prefix,
  className,
  id,
  name,
  rows = 4,
}: InputFieldProps) {
  return (
    <div className={cn("flex min-h-12 w-full items-center gap-2", className)}>
      {prefix && <span className="shrink-0 text-sm text-muted-foreground">{prefix}</span>}
      <InputControl
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        id={id}
        name={name}
        rows={rows}
      />
    </div>
  );
}

function InputControl({
  value,
  onChange,
  type,
  placeholder,
  disabled,
  required,
  id,
  name,
  rows,
}: Omit<InputFieldProps, "prefix" | "className"> & { type: NonNullable<InputFieldProps["type"]> }) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    if (type === "number" && !NUMERIC_PATTERN.test(nextValue)) return;
    onChange(nextValue);
  };

  if (type === "textarea") {
    return (
      <textarea
        id={id}
        name={name}
        className="min-h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
      />
    );
  }

  return (
    <Input
      id={id}
      name={name}
      type={type === "number" ? "text" : type}
      inputMode={type === "number" ? "numeric" : undefined}
      pattern={type === "number" ? "[0-9]*" : undefined}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      required={required}
    />
  );
}
