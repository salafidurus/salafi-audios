"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const params = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) {
      return;
    }
    handled.current = true;

    const ott = params.get("ott");
    const next = safeNext(params.get("redirect"));

    if (!ott) {
      router.replace(routes.signIn);
      return;
    }

    // Exchanging the one-time token returns the session and a `set-auth-token`
    // header; the auth client's onSuccess hook stores the bearer token.
    authClient.oneTimeToken
      .verify({ token: ott })
      .then((res: { error?: unknown }) => {
        router.replace(res.error ? routes.signIn : next);
      })
      .catch(() => router.replace(routes.signIn));
  }, [params, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
