"use client";

import { useProgressStore } from "@sd/domain-audio";
import { useToggleSaved } from "@sd/domain-content";
import React, { useState } from "react";

import { useAuth } from "@/core/auth";
import { AuthModal } from "@/features/auth";
import { Button } from "@/shared/components/Button/Button";

import styles from "./LectureSaveButton.module.css";

export type LectureSaveButtonProps = {
  lectureId: string;
};

export function LectureSaveButton({ lectureId }: LectureSaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isSaved = useProgressStore((s) => s.actions.isSaved(lectureId));
  const addSaved = useProgressStore((s) => s.actions.addSaved);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);
  const toggleSaved = useToggleSaved();

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const nextSaved = !isSaved;
    // Optimistic local update for instant button state; rolled back if the server call fails.
    if (nextSaved) {
      addSaved(lectureId);
    } else {
      removeSaved(lectureId);
    }

    toggleSaved.mutate(
      { listingId: lectureId, saved: nextSaved },
      {
        onError: () => {
          if (nextSaved) {
            removeSaved(lectureId);
          } else {
            addSaved(lectureId);
          }
        },
      },
    );
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
