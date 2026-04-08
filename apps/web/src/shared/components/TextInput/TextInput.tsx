"use client";

import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes } from "react";

export type TextInputWebProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style"> & {
  invalid?: boolean;
  onChangeText?: (value: string) => void;
  style?: CSSProperties;
};

export const TextInputWeb = forwardRef<HTMLInputElement, TextInputWebProps>(function TextInputWeb(
  { invalid = false, onChangeText, onFocus, onBlur, style, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      {...props}
      ref={ref}
      onChange={(event) => {
        onChangeText?.(event.target.value);
        props.onChange?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      style={{
        ...baseStyle,
        ...(invalid ? invalidStyle : isFocused ? focusedStyle : undefined),
        ...style,
      }}
    />
  );
});

const baseStyle: CSSProperties = {
  width: "100%",
  minHeight: "2.9rem",
  padding: "0.78rem 0.95rem",
  border: "1px solid var(--input-border-rest, var(--border-default))",
  borderRadius: "calc(var(--radius-component-chip) + 0.2rem)",
  background: "var(--input-surface-rest, var(--surface-subtle))",
  color: "var(--content-default)",
  fontFamily: "var(--typo-body-md-font-family), sans-serif",
  fontSize: "var(--typo-body-md-font-size)",
  lineHeight: "var(--typo-body-md-line-height)",
  letterSpacing: "var(--typo-body-md-letter-spacing)",
  transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
  boxSizing: "border-box",
  outline: "none",
};

const focusedStyle: CSSProperties = {
  borderColor: "var(--input-border-focus, var(--border-primary))",
  boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent-focus-ring) 24%, transparent)",
  background: "var(--input-surface-focus, var(--surface-default))",
};

const invalidStyle: CSSProperties = {
  borderColor: "var(--state-danger)",
  boxShadow: "0 0 0 3px color-mix(in srgb, var(--state-danger) 18%, transparent)",
};
