"use client";

import { useEffect, useRef } from "react";
import { Search } from "@/shared/components/Search";
import { useDropdownContext } from "./context";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./dropdown.module.css";

export interface DropdownContentProps {
  children: React.ReactNode;
  searchable?: boolean;
  className?: string;
}

export function DropdownContent({ children, searchable = false, className }: DropdownContentProps) {
  const { t } = useTranslation();
  const {
    open,
    setOpen,
    setHighlightedIndex,
    searchQuery,
    setSearchQuery,
    triggerRef,
    contentId,
    items,
    highlightedIndex,
    onValueChange,
    direction,
  } = useDropdownContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setHighlightedIndex(-1);
    setSearchQuery("");

    const timer = setTimeout(() => {
      contentRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open, setHighlightedIndex, setSearchQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        setOpen(false);
        return;
      }

      const filteredItems = searchable
        ? items.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : items;
      if (filteredItems.length === 0) {
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          const selected = filteredItems[highlightedIndex];
          if (!selected) {
            return;
          }
          onValueChange(selected.value);
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    open,
    items,
    searchable,
    searchQuery,
    highlightedIndex,
    onValueChange,
    setOpen,
    setHighlightedIndex,
    triggerRef,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, triggerRef]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setHighlightedIndex(-1);
  };

  return (
    <div
      ref={contentRef}
      role="listbox"
      id={contentId}
      tabIndex={-1}
      className={[styles.content, direction === "up" ? styles.contentUp : "", className]
        .filter(Boolean)
        .join(" ")}
      hidden={!open}
    >
      {searchable && (
        <div className={styles.searchWrapper}>
          <Search.Bar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t("search.placeholder", "Search")}
            inputWrapperStyle={{
              padding: `var(--space-scale-xs) var(--space-scale-sm)`,
              gap: `var(--space-scale-xs)`,
            }}
          />
        </div>
      )}
      <div className={styles.itemsList}>{children}</div>
    </div>
  );
}
