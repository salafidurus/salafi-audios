"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { Button } from "@/shared/components/Button/Button";
import styles from "./SearchButton.module.css";

export type SearchButtonProps = {
  label: string;
  onClick?: () => void;
};

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={styles.glyph}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 14.5L18 18" />
    </svg>
  );
}

export function SearchButton({ label, onClick }: SearchButtonProps) {
  const isDesktop = useIsDesktop();
  const [isPressed, setIsPressed] = useState(false);

  if (isDesktop) {
    return (
      <Button
        variant="surface"
        size="lg"
        fullWidth
        className={styles.searchButton}
        icon={<SearchGlyph />}
        label={label}
        onClick={onClick}
        aria-label={label}
      />
    );
  }

  return (
    <Button
      variant="surface"
      fullWidth
      className={`${styles.pillButton} ${isPressed ? styles.pressed : ""}`}
      icon={<Search size={20} />}
      label={label}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    />
  );
}
