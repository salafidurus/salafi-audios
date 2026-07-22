import React from "react";
import type { TypographyVariant } from "@sd/design-tokens";
import styles from "./app-text.module.css";

export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
  numberOfLines?: number;
  color?: "primary" | "secondary" | "muted" | "inherit";
};

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

  const colorKey = `color${color.charAt(0).toUpperCase()}${color.slice(1)}` as keyof typeof styles;
  const colorClass = styles[colorKey] ?? "";

  return (
    <span className={`${styles[variant]} ${colorClass}`} style={{ ...clampStyle, ...style }}>
      {children}
    </span>
  );
}
