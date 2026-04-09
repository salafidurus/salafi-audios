"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import styles from "./SearchButton.mobile.module.css";

export type SearchButtonMobileProps = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchButtonMobile({
  placeholder = "Search...",
  onPress,
}: SearchButtonMobileProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onPress}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${styles.container} ${isPressed ? styles.containerPressed : ""}`}
    >
      <Search size={20} color="var(--content-muted)" />
      <span className={styles.placeholder}>{placeholder}</span>
    </button>
  );
}
