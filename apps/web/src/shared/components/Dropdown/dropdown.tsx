"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { DropdownContext } from "./context";
import type { DropdownItem, DropdownContextValue } from "./types";

let contentCounter = 0;

export interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Dropdown({ value, onValueChange, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [contentId] = useState(() => "dropdown-content-" + ++contentCounter);
  const [items, setItems] = useState<DropdownItem[]>([]);

  const registerItem = useCallback((itemValue: string, label: string, disabled?: boolean) => {
    setItems((prev) => {
      if (prev.some((i) => i.value === itemValue)) return prev;
      return [...prev, { value: itemValue, label, disabled }];
    });
    return () => {
      setItems((prev) => prev.filter((i) => i.value !== itemValue));
    };
  }, []);

  const ctx = useMemo<DropdownContextValue>(
    () => ({
      open,
      setOpen,
      value,
      onValueChange,
      highlightedIndex,
      setHighlightedIndex,
      triggerRef,
      contentId,
      items,
      registerItem,
      searchQuery,
      setSearchQuery,
    }),
    [open, value, onValueChange, highlightedIndex, items, registerItem, contentId, searchQuery],
  );

  return <DropdownContext.Provider value={ctx}>{children}</DropdownContext.Provider>;
}
