"use client";

import { useState } from "react";
import styles from "./BrowseCard.mobile.module.css";

export type BrowseCardMobileProps = {
  name: string;
  onPress?: (name: string) => void;
};

export function BrowseCardMobile({ name, onPress }: BrowseCardMobileProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onPress?.(name)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${styles.card} ${isPressed ? styles.cardPressed : ""}`}
    >
      {name}
    </button>
  );
}
