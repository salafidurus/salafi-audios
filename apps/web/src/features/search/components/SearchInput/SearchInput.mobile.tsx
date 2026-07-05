"use client";

import React, { useImperativeHandle, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import styles from "./SearchInput.mobile.module.css";

export type SearchInputMobileProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  onBackPress?: () => void;
  ref?: React.Ref<SearchInputMobileRef>;
};

export type SearchInputMobileRef = {
  focus: () => void;
};

export function SearchInputMobile({
  placeholder,
  value,
  onChange,
  onBackPress,
  ref,
}: SearchInputMobileProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [backPressed, setBackPressed] = useState(false);
  const [clearPressed, setClearPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  return (
    <div className={`${styles.container} ${isFocused ? styles.containerFocused : ""}`}>
      <button
        type="button"
        onClick={onBackPress}
        onMouseDown={() => setBackPressed(true)}
        onMouseUp={() => setBackPressed(false)}
        onMouseLeave={() => setBackPressed(false)}
        className={styles.iconButton}
        aria-label="Go back"
      >
        <ChevronLeft
          size={20}
          color={backPressed ? "var(--content-primary)" : "var(--content-muted)"}
        />
      </button>

      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder={placeholder}
        aria-label={placeholder ?? "Search"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {value && value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange?.("")}
          onMouseDown={() => setClearPressed(true)}
          onMouseUp={() => setClearPressed(false)}
          onMouseLeave={() => setClearPressed(false)}
          className={styles.iconButton}
        >
          <X size={20} color={clearPressed ? "var(--content-primary)" : "var(--content-muted)"} />
        </button>
      ) : null}
    </div>
  );
}
