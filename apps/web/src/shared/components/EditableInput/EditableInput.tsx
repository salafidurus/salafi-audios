"use client";

import React from "react";
import styles from "./editable-input.module.css";

export interface EditableInputProps {
  /** Current input value */
  value: string;
  /** Fires on every keystroke */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Right side action button (edit/revert icon button) */
  rightButton?: React.ReactNode;
  /** Optional className for wrapper */
  className?: string;
  /** Optional id for linking to form submit button */
  id?: string;
  /** Optional name attribute */
  name?: string;
  /** Optional type attribute */
  type?: string;
}

export function EditableInput({
  value,
  onChange,
  placeholder,
  disabled,
  rightButton,
  className,
  id,
  name,
  type = "text",
}: EditableInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      <input
        id={id}
        type={type}
        name={name}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
      {rightButton && <div className={styles.rightButton}>{rightButton}</div>}
    </div>
  );
}
