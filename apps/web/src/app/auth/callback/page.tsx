"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth";

// Only allow in-app destinations to prevent open redirects via ?redirect=.
function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return routes.home;
}

function AuthCallbackInner() {
  const params = useSearchParams();

  useEffect(() => {
    const processAuth = async () => {
      const ott = params.get("ott");
      const next = safeNext(params.get("redirect"));

      if (!ott) {
        window.location.href = routes.signIn;
        return;
      }

      try {
        // Exchanging the one-time token returns the session and a `set-auth-token`
        // header; the auth client's onSuccess hook stores the bearer token.
        const res = await authClient.oneTimeToken.verify({ token: ott });
        const destination = res.error ? routes.signIn : next;
        window.location.href = destination;
      } catch {
        window.location.href = routes.signIn;
      }
    };

    processAuth();
  }, [params]);

  // Show nothing while processing - redirect will happen via window.location
  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
