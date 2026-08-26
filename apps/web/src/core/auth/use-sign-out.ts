"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { hasWindow } from "@/shared/lib/runtime-guards";

import { authClient } from "./auth-client";

export function useSignOut() {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    setError(null);
    try {
      await authClient.signOut();
      if (hasWindow() && window.location) {
        window.location.href = "/";
      } else {
        router.push("/");
      }
    } catch (cause) {
      console.error("Sign out error", cause);
      setError(t("account.profile.signOutError", "Sign out failed. Please try again."));
      throw cause;
    }
  };

  return { signOut, error };
}
