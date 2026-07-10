"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useDropdownContext } from "./context";
import styles from "./dropdown.module.css";

export interface DropdownItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function DropdownItem({ value, children, disabled }: DropdownItemProps) {
  const {
    value: selectedValue,
    onValueChange,
    setOpen,
    triggerRef,
    registerItem,
    searchQuery,
  } = useDropdownContext();
  const isSelected = selectedValue === value;
  const label = typeof children === "string" ? children : "";

  useLayoutEffect(() => {
    const unregister = registerItem(value, label, disabled);
    return unregister;
  }, [value, label, disabled, registerItem]);

  if (searchQuery && label && !label.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={[
        styles.item,
        isSelected ? styles.itemSelected : "",
        disabled ? styles.itemDisabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (disabled) return;
        onValueChange(value);
        setOpen(false);
        triggerRef.current?.focus();
      }}
      disabled={disabled}
    >
      <span className={styles.itemLabel}>{children}</span>
      {isSelected && <Check size={16} className={styles.checkmark} />}
    </button>
  );
}
