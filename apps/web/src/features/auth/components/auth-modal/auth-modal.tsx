"use client";

import React, { useEffect, useRef, useSyncExternalStore, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { LazyMotion, AnimatePresence, m } from "framer-motion";
import { domAnimation } from "framer-motion";
import { useTranslation } from "@/core/i18n/use-translation";
import { authClient } from "@/core/auth";
import { buildOAuthCallbackURL } from "@/features/auth/oauth-callback-url";
import { AppleSignInButton, GoogleSignInButton } from "../social-buttons";
import styles from "./auth-modal.module.css";

export type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
};

const getRedirectTo = () => {
  if (typeof window !== "undefined") {
    return window.location.pathname + window.location.search;
  }
  return "/";
};

export function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCloseKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("keydown", handleCloseKeydown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleCloseKeydown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleCloseKeydown]);

  // Focus trap: focus the modal card when it opens
  useEffect(() => {
    if (isOpen && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isOpen]);

  const handleSignIn = (provider: "google" | "apple") => {
    authClient.signIn.social({
      provider,
      callbackURL: buildOAuthCallbackURL(getRedirectTo()),
    });
  };

  if (!mounted) {
    return null;
  }

  const modalContent = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <div className={styles.overlayWrapper} suppressHydrationWarning>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.overlayBackdrop}
              onClick={onClose}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  onClose();
                }
              }}
              role="button"
              tabIndex={0}
            />
            <m.div
              ref={cardRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={styles.card}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>

              <div className={styles.header}>
                <div className={styles.logoContainer}>
                  <Image
                    src="/logo/logo_72.png"
                    alt="Salafi Durus Logo"
                    width={72}
                    height={72}
                    priority
                  />
                </div>
                <h2 id="auth-modal-title" className={styles.title}>
                  Salafi Durus
                </h2>
                <p className={styles.tagline}>
                  {t("auth.signIn.tagline", "Join the community of learners")}
                </p>
              </div>

              {message && (
                <div className={styles.messageContainer}>
                  <p className={styles.message}>{message}</p>
                </div>
              )}

              <div className={styles.socialStack}>
                <AppleSignInButton onClick={() => handleSignIn("apple")} />
                <GoogleSignInButton onClick={() => handleSignIn("google")} />
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );

  return createPortal(modalContent, document.body);
}
