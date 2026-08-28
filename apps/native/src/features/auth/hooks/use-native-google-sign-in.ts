import {
  GoogleSignin,
  type SignInResponse,
  type User,
} from "@react-native-google-signin/google-signin";
import { useCallback, useState } from "react";
import { z } from "zod";

import { authClient, refreshSession } from "@/core/auth";
import { getGoogleWebClientId } from "@/core/config/runtime-env";

// The library's shipped types resolve to its web variant under this project's
// `moduleSuffixes` (tries `.web` before the unsuffixed native file), which
// types `signIn()` as `Promise<User>` instead of the real native
// `SignInResponse` union. Metro still bundles the real native implementation;
// this local type just corrects what TS sees it returning.
/** Encapsulates a user-facing native feature and its local integration boundaries. */
type NativeGoogleSignInResponse =
  | { type: "success"; data: { idToken: string | null } }
  | { type: "cancelled"; data: null };

type NativeGoogleSignInResponseCandidate =
  | SignInResponse
  | User
  | { type?: string; data?: { idToken?: string | null } | null };

const NativeGoogleSignInResponseSchema = z.union([
  z.object({
    type: z.literal("success"),
    data: z.object({ idToken: z.string().nullable() }),
  }),
  z.object({
    type: z.literal("cancelled"),
    data: z.null(),
  }),
]);

function parseNativeGoogleSignInResponse(
  candidate: NativeGoogleSignInResponseCandidate,
): NativeGoogleSignInResponse {
  return NativeGoogleSignInResponseSchema.parse(candidate);
}

/** Provides native google sign in state and behavior to native consumers. */
export function useNativeGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      GoogleSignin.configure({ webClientId: getGoogleWebClientId() });
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = parseNativeGoogleSignInResponse(await GoogleSignin.signIn());
      if (response.type === "cancelled") {
        return;
      }

      if (!response.data.idToken) {
        throw new Error("No ID token returned from Google");
      }

      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        idToken: { token: response.data.idToken },
      });

      if (signInError) {
        throw new Error(signInError.message ?? "Google Sign-In failed");
      }

      await refreshSession();
      // Router navigation handled by parent component watching auth state via useAuth()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google Sign-In failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signIn, isLoading, error };
}
