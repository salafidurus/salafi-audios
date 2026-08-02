"use client";

import { useIsSaved, markSaved, markUnsaved } from "@sd/domain-content";
import React, { useState } from "react";

import { useAuth } from "@/core/auth";
import { AuthModal } from "@/features/auth";
import { Button } from "@/shared/components/Button/Button";

import styles from "./LectureSaveButton.module.css";

export type LectureSaveButtonProps = {
  lectureId: string;
  /** Required for the save/unsave push to resolve server-side (it resolves by slug, not id). */
  lectureSlug?: string;
};

export function LectureSaveButton({ lectureId, lectureSlug }: LectureSaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isSaved = useIsSaved(lectureId);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Local-first: optimistic instantly, debounced push with persisted-outbox
    // retry on failure — no manual rollback needed here anymore.
    if (isSaved) {
      markUnsaved(lectureId, lectureSlug);
    } else {
      markSaved(lectureId, lectureSlug);
    }
  };

  return (
    <>
      <Button
        variant={isSaved ? "surface" : "outline"}
        size="lg"
        onClick={handleClick}
        className={styles.button}
      >
        {isSaved ? "✓ Saved" : "Save"}
      </Button>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign in to save lectures to your library."
      />
    </>
  );
}
