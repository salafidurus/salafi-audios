import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import { useState, useCallback } from "react";

import { refreshSession } from "@/core/auth";
import { getApiBaseUrl } from "@/core/config/runtime-env";

export function useNativeAppleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        setError("Apple Sign-In is not available on this device");
        return;
      }
    } catch {
      setError("Failed to check Apple Sign-In availability");
      return;
    }

    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token returned from Apple");
      }

      const response = await fetch(`${getApiBaseUrl()}/api/auth/apple/native`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: {
            id: credential.user,
            email: credential.email,
            firstName: credential.fullName?.givenName,
            lastName: credential.fullName?.familyName,
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Server returned ${response.status}: ${body}`);
      }

      const { session } = (await response.json()) as {
        session: { id: string; expiresAt?: string };
      };

      // Persist session token using better-auth expo client cookie structure
      const cookieData = JSON.stringify({
        "better-auth.session_token": {
          value: session.id,
          expires: session.expiresAt ?? null,
        },
      });
      await SecureStore.setItemAsync("better-auth_cookie", cookieData);

      // Force useSession() to pick up the session we just wrote directly to
      // SecureStore - this custom endpoint doesn't go through better-auth's
      // normal Set-Cookie flow, so nothing else would trigger a refetch.
      await refreshSession();

      setIsLoading(false);
      // Router navigation handled by parent component watching auth state via useAuth()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Apple Sign-In failed";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  return { signIn, isLoading, error };
}
