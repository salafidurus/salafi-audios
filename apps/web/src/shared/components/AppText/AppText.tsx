import React from "react";
import type { TypographyVariant } from "@sd/design-tokens";
import styles from "./app-text.module.css";

export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
  numberOfLines?: number;
};

export function AppText({ variant, children, style, numberOfLines }: AppTextProps) {
  const clampStyle: React.CSSProperties =
    numberOfLines != null
      ? {
          display: "-webkit-box",
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : {};

  return (
    <span className={styles[variant]} style={{ ...clampStyle, ...style }}>
      {children}
    </span>
  );
}
