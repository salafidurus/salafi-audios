"use client";

import { useState } from "react";

export type BrowseCardDesktopWebProps = {
  name: string;
  onPress?: (name: string) => void;
};

const labelStyle = {
  fontFamily: "var(--typo-label-md-font-family)",
  fontSize: "var(--typo-label-md-font-size)",
  lineHeight: "var(--typo-label-md-line-height)",
  letterSpacing: "var(--typo-label-md-letter-spacing)",
  fontWeight: "var(--typo-label-md-font-weight)",
} as const;

export function BrowseCardDesktopWeb({ name, onPress }: BrowseCardDesktopWebProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onPress?.(name)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className="flex min-h-[7rem] w-full items-center justify-center rounded-[var(--radius-component-card)] border px-[var(--space-component-card-padding)] py-[var(--space-component-gap-lg)] text-center text-[var(--content-default)] transition hover:border-[var(--accent-primary-subtle-border)] hover:bg-[var(--accent-primary-subtle-surface)] hover:text-[var(--content-primary)]"
      style={{
        ...labelStyle,
        borderColor: isPressed ? "var(--border-primary)" : "var(--border-default)",
        background: isPressed ? "var(--surface-hover)" : "var(--surface-default)",
      }}
    >
      {name}
    </button>
  );
}
