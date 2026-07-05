import React from "react";
import styles from "./screen-view.module.css";

export interface ScreenViewProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

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
