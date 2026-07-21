"use client";

import { Suspense } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/core/auth/auth-client";
import Link from "next/link";
import { useTranslation } from "@/core/i18n/use-translation";

function AuthCallbackContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { data: session, isPending, error } = authClient.useSession();
  const [timeoutError, setTimeoutError] = useState(false);

  // Timeout after 10 seconds to prevent infinite loading
  useEffect(() => {
    if (!isPending) {
      return;
    }

    const timeout = setTimeout(() => {
      setTimeoutError(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isPending]);

  // Redirect if session loaded successfully using Next.js redirect() function
  if (session?.user && !isPending && !timeoutError && !error) {
    const redirectTo = searchParams.get("redirect");
    const safeRedirect =
      typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/";
    redirect(safeRedirect);
  }

  if (timeoutError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("authCallback.timeoutTitle", "Authentication Timeout")}
          </h1>
          <p className="text-gray-600 mb-4">
            {t("authCallback.timeoutDesc", "Authentication is taking longer than expected.")}
          </p>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            {t("authCallback.pleaseTryAgain", "Please try again")}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("authCallback.errorTitle", "Authentication Error")}
          </h1>
          <p className="text-gray-600 mb-4">
            {error.message || t("authCallback.unexpectedError", "An unexpected error occurred.")}
          </p>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            {t("authCallback.tryAgain", "Try again")}
          </Link>
        </div>
      </div>
    );
  }

  // Loading state - session being verified
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {t("authCallback.completingSignIn", "Completing sign-in...")}
        </p>
      </div>
    </div>
  );
}

function AuthCallbackFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">{t("common.loading", "Loading...")}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
