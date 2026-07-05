import clsx from "clsx";
import type { CSSProperties } from "react";

export type SearchButtonDesktopProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  size?: "lg" | "sm";
  className?: string;
};

const baseClass =
  "flex w-full items-center gap-3 rounded-[var(--radius-scale-full)] border text-[var(--content-default)] transition hover:-translate-y-px hover:saturate-[1.01]";

const sizeClass: Record<NonNullable<SearchButtonDesktopProps["size"]>, string> = {
  lg: "px-5 py-3",
  sm: "px-[0.82rem] py-[0.52rem]",
};

const textStyle: Record<NonNullable<SearchButtonDesktopProps["size"]>, CSSProperties> = {
  lg: {
    fontFamily: "var(--typo-body-lg-font-family)",
    fontSize: "var(--typo-body-lg-font-size)",
    lineHeight: "var(--typo-body-lg-line-height)",
    letterSpacing: "var(--typo-body-lg-letter-spacing)",
    fontWeight: "var(--typo-body-lg-font-weight)",
  },
  sm: {
    fontFamily: "var(--typo-body-sm-font-family)",
    fontSize: "var(--typo-body-sm-font-size)",
    lineHeight: "1",
    letterSpacing: "var(--typo-body-sm-letter-spacing)",
    fontWeight: "var(--typo-body-sm-font-weight)",
  },
};

const accentStyle: CSSProperties = {
  borderColor: "var(--accent-primary-subtle-border, var(--border-default))",
  background: "var(--accent-primary-subtle-surface, var(--surface-default))",
  color: "var(--accent-primary-subtle-fg, var(--content-default))",
  boxShadow: "var(--shadow-sm)",
};

export function SearchButtonDesktop({
  label,
  href,
  onClick,
  size = "lg",
  className,
}: SearchButtonDesktopProps) {
  const classes = clsx(baseClass, sizeClass[size], className);
  const style = textStyle[size];

  if (href) {
    return (
      <a href={href} className={classes} style={{ ...style, ...accentStyle }} aria-label={label}>
        <SearchGlyph />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      style={{ ...style, ...accentStyle }}
      onClick={onClick}
    >
      <SearchGlyph />
      <span>{label}</span>
    </button>
  );
}

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4 text-[var(--content-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 14.5L18 18" />
    </svg>
  );
}
