import React from "react";

import styles from "./screen-view.module.css";

/** Provides a shared page-sized surface for web screens. */
/** Layout options for a page-sized content surface. */
export interface ScreenViewProps {
  /** Content rendered inside the responsive page surface. */
  children: React.ReactNode;
  /** Inline styles applied to the outer surface. */
  style?: React.CSSProperties;
  /** Inline styles applied to the inner content container. */
  contentStyle?: React.CSSProperties;
  /** Centers the inner content vertically and horizontally. */
  center?: boolean;
  /** Design-token background treatment applied to the outer surface. */
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

/** Provides the shared page background and content sizing boundary. */
export function ScreenView({
  children,
  style,
  contentStyle,
  center,
  backgroundVariant = "canvas",
}: ScreenViewProps) {
  return (
    <div
      className={styles.container}
      style={{ ...getBackgroundVariant(backgroundVariant), ...style }}
    >
      <div className={`${styles.content}${center ? ` ${styles.center}` : ""}`} style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

function getBackgroundVariant(variant: ScreenViewProps["backgroundVariant"]): React.CSSProperties {
  switch (variant) {
    case "primaryWash":
      return { backgroundImage: "var(--screen-wash-primary)", backgroundRepeat: "no-repeat" };
    case "secondaryWash":
      return { backgroundImage: "var(--screen-wash-secondary)", backgroundRepeat: "no-repeat" };
    case "mixedWash":
      return {
        backgroundColor: "var(--accent-mixed-surface, var(--surface-canvas))",
        backgroundImage: "var(--screen-wash-mixed)",
        backgroundRepeat: "no-repeat",
      };
    case "canvas":
    default:
      return {};
  }
}
