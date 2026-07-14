"use client";

import { ChevronDown } from "lucide-react";
import { useDropdownContext } from "./context";
import styles from "./dropdown.module.css";

export interface DropdownTriggerProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  testId?: string;
  ariaLabel?: string;
}

export function DropdownTrigger({
  placeholder = "Select...",
  className,
  disabled: disabledProp,
  id,
  testId,
  ariaLabel,
}: DropdownTriggerProps) {
  const {
    open,
    setOpen,
    value,
    triggerRef,
    items,
    contentId,
    disabled: disabledContext,
    error,
  } = useDropdownContext();

  const disabled = disabledProp ?? disabledContext;
  const selectedLabel = items.find((i) => i.value === value)?.label ?? "";
  const hasError = !!error;

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-invalid={hasError}
      aria-controls={contentId}
      aria-label={ariaLabel}
      id={id}
      data-testid={testId}
      className={[
        styles.trigger,
        open ? styles.triggerOpen : "",
        hasError ? styles.triggerError : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (!disabled) setOpen(!open);
      }}
      disabled={disabled}
    >
      <span className={selectedLabel ? styles.triggerText : styles.triggerPlaceholder}>
        {selectedLabel || placeholder}
      </span>
      <ChevronDown
        size={16}
        className={[styles.chevron, open ? styles.chevronOpen : ""].filter(Boolean).join(" ")}
      />
    </button>
  );
}
