"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { Search } from "@/shared/components/Search";
import { useDropdownContext } from "./context";
import styles from "./dropdown.module.css";

export interface DropdownContentProps {
  children: React.ReactNode;
  searchable?: boolean;
  className?: string;
}

export function DropdownContent({ children, searchable = false, className }: DropdownContentProps) {
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
  } = useDropdownContext();
  const contentRef = useRef<HTMLDivElement>(null);

  const { floatingStyles, refs } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
    middleware: [
      offset(6),
      flip({
        fallbackPlacements: ["top-start"],
        padding: 8,
      }),
      shift({ padding: 8 }),
    ],
  });

  // Connect the refs after they are mounted
  useEffect(() => {
    if (triggerRef.current && contentRef.current) {
      refs.setReference(triggerRef.current);
      refs.setFloating(contentRef.current);
    }
  }, [refs, triggerRef]);

  useEffect(() => {
    if (!open) return;
    setHighlightedIndex(-1);
    setSearchQuery("");

    const timer = setTimeout(() => {
      contentRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open, setHighlightedIndex, setSearchQuery]);

  useEffect(() => {
    if (!open) return;

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
      if (filteredItems.length === 0) return;

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
          if (!selected) return;
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
    if (!open) return;

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

  if (typeof window === "undefined") return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {open && (
          <m.div
            ref={contentRef}
            role="listbox"
            id={contentId}
            tabIndex={-1}
            initial={{ opacity: 0, transform: "scale(0.98) translateY(-4px)" }}
            animate={{ opacity: 1, transform: "scale(1) translateY(0)" }}
            exit={{ opacity: 0, transform: "scale(0.98) translateY(-4px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={[styles.content, className].filter(Boolean).join(" ")}
            style={floatingStyles as React.CSSProperties}
          >
            {searchable && (
              <div className={styles.searchWrapper}>
                <Search.Bar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                />
              </div>
            )}
            <div className={styles.itemsList}>{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>,
    document.body,
  );
}
