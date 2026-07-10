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
}

export function DropdownTrigger({
  placeholder = "Select...",
  className,
  disabled,
  id,
  testId,
}: DropdownTriggerProps) {
  const { open, setOpen, value, triggerRef, items, contentId } = useDropdownContext();

  const selectedLabel = items.find((i) => i.value === value)?.label ?? "";

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={contentId}
      id={id}
      data-testid={testId}
      className={[styles.trigger, open ? styles.triggerOpen : "", className]
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
