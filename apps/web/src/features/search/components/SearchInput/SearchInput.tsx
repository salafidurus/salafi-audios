"use client";

import React, { forwardRef, useRef, useImperativeHandle, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { Button } from "@/shared/components/Button/Button";
import styles from "./SearchInput.module.css";

export type SearchInputRef = { focus: () => void };

export type SearchInputProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  onBackPress?: () => void;
};

export const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(function SearchInput(
  { autoFocus, onBackPress, placeholder, value, onChange },
  ref,
) {
  const isDesktop = useIsDesktop();
  const nativeRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => nativeRef.current?.focus() }), []);

  if (isDesktop) {
    return (
      <label className={styles.label} aria-label="Search library">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={styles.glyph}
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M14.5 14.5L18 18" />
        </svg>
        <input
          ref={nativeRef}
          type="search"
          placeholder={placeholder}
          className={styles.input}
          aria-label={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          autoFocus={autoFocus}
        />
      </label>
    );
  }

  return (
    <MobileSearchInput
      inputRef={nativeRef}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBackPress={onBackPress}
    />
  );
});

type MobileInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  onBackPress?: () => void;
};

function MobileSearchInput({
  inputRef,
  placeholder,
  value,
  onChange,
  onBackPress,
}: MobileInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [backPressed, setBackPressed] = useState(false);
  const [clearPressed, setClearPressed] = useState(false);

  return (
    <div className={`${styles.container} ${isFocused ? styles.focused : ""}`}>
      <Button
        variant="ghost"
        size="icon"
        icon={<ChevronLeft size={20} />}
        onClick={onBackPress}
        onMouseDown={() => setBackPressed(true)}
        onMouseUp={() => setBackPressed(false)}
        onMouseLeave={() => setBackPressed(false)}
        aria-label="Go back"
        style={
          {
            "--btn-fg": backPressed ? "var(--content-primary)" : "var(--content-muted)",
          } as React.CSSProperties
        }
      />

      <input
        ref={inputRef}
        type="text"
        className={styles.textInput}
        placeholder={placeholder}
        aria-label={placeholder ?? "Search"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {value && value.length > 0 ? (
        <Button
          variant="ghost"
          size="icon"
          icon={<X size={20} />}
          onClick={() => onChange?.("")}
          onMouseDown={() => setClearPressed(true)}
          onMouseUp={() => setClearPressed(false)}
          onMouseLeave={() => setClearPressed(false)}
          aria-label="Clear search"
          style={
            {
              "--btn-fg": clearPressed ? "var(--content-primary)" : "var(--content-muted)",
            } as React.CSSProperties
          }
        />
      ) : null}
    </div>
  );
}
