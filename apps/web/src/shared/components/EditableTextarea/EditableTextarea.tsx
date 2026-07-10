"use client";

import React from "react";
import styles from "./editable-textarea.module.css";

export interface EditableTextareaProps {
  /** Current textarea value */
  value: string;
  /** Fires on every keystroke */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether textarea is disabled */
  disabled?: boolean;
  /** Right side action button (edit/revert icon button) */
  rightButton?: React.ReactNode;
  /** Optional className for wrapper */
  className?: string;
  /** Optional id for linking to form submit button */
  id?: string;
  /** Optional name attribute */
  name?: string;
  /** Minimum rows to display */
  rows?: number;
}

export function EditableTextarea({
  value,
  onChange,
  placeholder,
  disabled,
  rightButton,
  className,
  id,
  name,
  rows = 4,
}: EditableTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      <textarea
        id={id}
        name={name}
        className={styles.textarea}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        rows={rows}
      />
      {rightButton && <div className={styles.rightButton}>{rightButton}</div>}
    </div>
  );
}
