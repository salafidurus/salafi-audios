/** Provides the responsive sign-in prompt used when protected content is unavailable. */
"use client";

import React, { useState } from "react";

import { AuthModal } from "@/features/auth";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { AuthRequiredStateDesktop } from "./AuthRequiredState.desktop";
import { AuthRequiredStateMobile } from "./AuthRequiredState.mobile";

/** Text and optional action label shown when a feature requires authentication. */
export type AuthRequiredStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

/** Shows the responsive sign-in prompt and opens the shared authentication modal. */
export function AuthRequiredState({ title, description, actionLabel }: AuthRequiredStateProps) {
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();
  const [showModal, setShowModal] = useState(false);

  if (!isHydrated) {
    return null;
  }

  const handlePress = () => {
    setShowModal(true);
  };

  return (
    <>
      {isMobile || isTablet ? (
        <AuthRequiredStateMobile
          title={title}
          description={description}
          actionLabel={actionLabel}
          onPress={handlePress}
        />
      ) : (
        <AuthRequiredStateDesktop
          title={title}
          description={description}
          actionLabel={actionLabel}
          onPress={handlePress}
        />
      )}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} message={title} />
    </>
  );
}
