"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  Children,
  isValidElement,
  type ReactNode,
} from "react";
import { DropdownContext } from "./context";
import { DropdownItem as DropdownItemComponent } from "./dropdown-item";
import type { DropdownItem, DropdownContextValue } from "./types";

function extractItemsFromChildren(children: ReactNode): DropdownItem[] {
  const extracted: DropdownItem[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return;
    if (child.type === DropdownItemComponent) {
      const label = typeof child.props.children === "string" ? child.props.children : "";
      extracted.push({
        value: (child.props as Record<string, unknown>).value as string,
        label,
        disabled: (child.props as Record<string, unknown>).disabled as boolean | undefined,
      });
    }
    if (child.props.children) {
      extracted.push(...extractItemsFromChildren(child.props.children));
    }
  });
  return extracted;
}

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
  const [items, setItems] = useState<DropdownItem[]>(() => extractItemsFromChildren(children));

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
