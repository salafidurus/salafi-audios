"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function TitleTextDesktopWeb({ children }: Props) {
  return (
    <p
      className="text-[var(--content-primary)]"
      style={{
        fontFamily: "var(--typo-display-md-font-family)",
        fontSize: "var(--typo-display-md-font-size)",
        lineHeight: "var(--typo-display-md-line-height)",
        letterSpacing: "var(--typo-display-md-letter-spacing)",
        fontWeight: "var(--typo-display-md-font-weight)",
      }}
    >
      {children}
    </p>
  );
}
