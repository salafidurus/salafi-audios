"use client";

import React from "react";
import styles from "./input-field.module.css";

export interface InputFieldProps {
  /** Current input value */
  value: string;
  /** Fires on every keystroke */
  onChange: (value: string) => void;
  /** Field type. "number" renders a text input that only accepts digits. */
  type?: "text" | "url" | "number" | "textarea";
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Leading label rendered inside the bordered wrapper, e.g. "https://x.com/" */
  prefix?: React.ReactNode;
  /** Optional className for wrapper */
  className?: string;
  /** Optional id for linking to a <label> */
  id?: string;
  /** Optional name attribute */
  name?: string;
  /** Rows for type="textarea" */
  rows?: number;
}

const NUMERIC_PATTERN = /^\d*$/;

export function InputField({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  prefix,
  className,
  id,
  name,
  rows = 4,
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    if (type === "number" && !NUMERIC_PATTERN.test(nextValue)) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      {type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          className={styles.textarea}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "numeric" : undefined}
          pattern={type === "number" ? "[0-9]*" : undefined}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
        />
      )}
    </div>
  );
}
