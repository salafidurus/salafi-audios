import type { TypographyVariant } from "@sd/design-tokens";

import React from "react";

import styles from "./app-text.module.css";

/** Provides token-backed typography primitives. */
/** Props for token-backed typography with optional color and line clamping. */
export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
  numberOfLines?: number;
  color?: "primary" | "secondary" | "muted" | "inherit";
};

const COLOR_CLASS_MAP = {
  primary: styles.colorPrimary,
  secondary: styles.colorSecondary,
  muted: styles.colorMuted,
  inherit: styles.colorInherit,
} as const;

/** Applies design-token typography without introducing a second text-style vocabulary. */
export function AppText({
  variant,
  children,
  style,
  numberOfLines,
  color = "inherit",
}: AppTextProps) {
  const clampStyle: React.CSSProperties =
    numberOfLines != null
      ? {
          display: "-webkit-box",
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : {};

  const colorClass = COLOR_CLASS_MAP[color];

  return (
    <span className={`${styles[variant]} ${colorClass}`} style={{ ...clampStyle, ...style }}>
      {children}
    </span>
  );
}
