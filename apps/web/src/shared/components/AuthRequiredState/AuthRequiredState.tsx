"use client";

import React, { useState } from "react";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { AuthModal } from "@/features/auth";
import {
  AuthRequiredStateDesktop,
} from "./AuthRequiredState.desktop";
import { AuthRequiredStateMobile } from "./AuthRequiredState.mobile";

export type AuthRequiredStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

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
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={title}
      />
    </>
  );
}
