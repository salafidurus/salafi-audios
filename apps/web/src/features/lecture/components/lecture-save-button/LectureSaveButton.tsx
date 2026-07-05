"use client";

import React, { useState } from "react";
import { useProgressStore } from "@sd/domain-audio";
import { Button } from "@/shared/components/Button/Button";
import { useAuth } from "@/core/auth";
import { AuthModal } from "@/features/auth";

export type LectureSaveButtonProps = {
  lectureId: string;
};

export function LectureSaveButton({ lectureId }: LectureSaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isSaved = useProgressStore((s) => s.actions.isSaved(lectureId));
  const addSaved = useProgressStore((s) => s.actions.addSaved);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isSaved) {
      removeSaved(lectureId);
    } else {
      addSaved(lectureId);
    }
  };

  return (
    <>
      <Button
        variant={isSaved ? "surface" : "outline"}
        size="lg"
        onClick={handleClick}
        style={{ width: "100%", marginTop: 8 }}
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
