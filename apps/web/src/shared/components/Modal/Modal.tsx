"use client";

import { useEffect, useRef, useEffectEvent, type ReactNode, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./modal.module.css";

function getModalPortalRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.body;
}

function subscribeModalPortalRoot(): (() => void) {
  return () => {};
}

const JUSTIFY_MAP = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  "flex-end": "flex-end",
  "space-between": "space-between",
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  width?: string | number;
  hideFooter?: boolean;
  footerAlignment?: "left" | "right" | "center" | "space-between";
  footerBorder?: boolean;
  loading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  width,
  hideFooter,
  footerAlignment = "right",
  footerBorder: _footerBorder = false,
  loading,
}: ModalProps) {
  const portalRoot = useSyncExternalStore(
    subscribeModalPortalRoot,
    getModalPortalRoot,
    () => null,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCloseEvent = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseEvent();
    };
    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  const justifyContent = JUSTIFY_MAP[footerAlignment as keyof typeof JUSTIFY_MAP] || "flex-end";

  const customWidth = width ? (typeof width === "number" ? `${width}px` : width) : undefined;

  if (!portalRoot) return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <div className={styles.overlay}>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.backdrop}
              onClick={loading ? undefined : onClose}
            />
            <m.div
              ref={contentRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`${styles.content} ${styles[`size-${size}`]}`}
              onClick={(e) => e.stopPropagation()}
              style={
                customWidth
                  ? { width: `min(${customWidth}, calc(100% - var(--space-lg)))` }
                  : undefined
              }
            >
              {title && (
                <header className={styles.header}>
                  <h2 id="modal-title" className={styles.title}>
                    {title}
                  </h2>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close dialog"
                    disabled={loading}
                  >
                    <X size={20} />
                  </button>
                </header>
              )}
              {children && <div className={styles.body}>{children}</div>}
              {footer && !hideFooter && (
                <footer
                  className={styles.footer}
                  style={{
                    justifyContent,
                  }}
                >
                  {footer}
                </footer>
              )}
              {loading && <div className={styles.loadingOverlay} />}
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>,
    portalRoot!,
  );
}

// Compound components for advanced use cases
interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  loading?: boolean;
}

export function ModalHeader({ children, onClose, loading }: ModalHeaderProps) {
  return (
    <header className={styles.header}>
      <h2 id="modal-title" className={styles.title}>
        {children}
      </h2>
      {onClose && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
          disabled={loading}
        >
          <X size={20} />
        </button>
      )}
    </header>
  );
}

interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
  return <div className={styles.body}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  alignment?: "left" | "right" | "center" | "space-between";
  border?: boolean;
}

export function ModalFooter({ children, alignment = "right", border = true }: ModalFooterProps) {
  const justifyContent = JUSTIFY_MAP[alignment as keyof typeof JUSTIFY_MAP] || "flex-end";

  return (
    <footer
      className={styles.footer}
      style={{
        justifyContent,
        borderTop: border ? `1px solid var(--border-subtle)` : "none",
      }}
    >
      {children}
    </footer>
  );
}

// Attach compound components to Modal
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
