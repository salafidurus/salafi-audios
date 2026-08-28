import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import { useState, useCallback } from "react";
import { z } from "zod";

import { refreshSession } from "@/core/auth";
import { getApiBaseUrl } from "@/core/config/runtime-env";

/** Provides the native features auth hooks use-native-apple-sign-in module responsibility. */
const AppleNativeSessionResponseSchema = z.object({
  session: z.object({
    id: z.string(),
    expiresAt: z.string().optional(),
  }),
});

async function checkAppleAvailability(): Promise<string | null> {
  try {
    if (await AppleAuthentication.isAvailableAsync()) return null;
    return "Apple Sign-In is not available on this device";
  } catch {
    return "Failed to check Apple Sign-In availability";
  }
}

async function completeAppleSignIn() {
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

  const { session } = AppleNativeSessionResponseSchema.parse(await response.json());
  const cookieData = JSON.stringify({
    "better-auth.session_token": {
      value: session.id,
      expires: session.expiresAt ?? null,
    },
  });
  await SecureStore.setItemAsync("better-auth_cookie", cookieData);
  await refreshSession();
}

/** Describes the useNativeAppleSignIn native function contract and behavior. */
export function useNativeAppleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);

    const availabilityError = await checkAppleAvailability();
    if (availabilityError) {
      setError(availabilityError);
      return;
    }

    setIsLoading(true);

    try {
      await completeAppleSignIn();

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
