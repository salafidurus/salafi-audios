"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSyncExternalStore } from "react";
import styles from "./modal.module.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
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
              onClick={onClose}
            />
            <m.div
              ref={contentRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`${styles.content} ${styles[`size-${size}`]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <header className={styles.header}>
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </header>
              <div className={styles.body}>{children}</div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );

  return createPortal(modalContent, document.body);
}
