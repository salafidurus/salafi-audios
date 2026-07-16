"use client";

import { useEffect, useRef, useEffectEvent } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import { NavItems } from "./nav-items";
import styles from "./sidebar-drawer.module.css";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCloseEvent = useEffectEvent(() => {
    onClose();
  });

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    // Lock body scroll
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Trap focus within drawer
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseEvent();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus drawer content
    contentRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={handleBackdropClick} aria-hidden="true" />
      )}

      {/* Drawer */}
      <nav
        ref={drawerRef}
        className={styles.drawer}
        data-open={isOpen}
        aria-label={t("navigation.mobileNav", "Mobile navigation")}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{t("navigation.menu", "Menu")}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t("navigation.closeMenu", "Close menu")}
          >
            <X size={24} />
          </button>
        </div>

        <div ref={contentRef} className={styles.content} tabIndex={-1}>
          <NavItems onItemClick={onClose} />
        </div>
      </nav>
    </>
  );
}
