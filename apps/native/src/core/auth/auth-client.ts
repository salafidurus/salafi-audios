import { expoClient } from "@better-auth/expo/client";
import { queryKeys } from "@sd/core-contracts";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { getApiBaseUrl } from "../config/runtime-env";
import { queryClient } from "../query-client";

/** Provides the native core auth auth-client module responsibility. */
const rawScheme = Constants.expoConfig?.scheme;
const scheme = Array.isArray(rawScheme) ? rawScheme[0] : (rawScheme ?? "salafidurus");

/** Describes the const authClient = createAuthClient({ native declaration contract and behavior. */
export const authClient = createAuthClient({
  baseURL: getApiBaseUrl() ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  plugins: [
    expoClient({
      scheme,
      storage: SecureStore,
    }),
  ],
});

/** Describes the User native type contract and behavior. */
export type User = typeof authClient.$Infer.Session.user;

// Native (idToken-based) sign-in isn't in better-auth's core atomListeners
// path-matcher (only /sign-in/email, /sign-out, etc. are), so useSession()
// isn't guaranteed to reactively pick up a new session on its own after
// signIn.social({ idToken }) or a custom sign-in endpoint. Call this
// afterward to force the session atom's own refetch — not a raw $fetch,
// which wouldn't update the atom useSession() actually subscribes to.
/** Describes the refreshSession native function contract and behavior. */
export async function refreshSession(): Promise<void> {
  const session = authClient.$store.atoms.session?.get();
  await session?.refetch?.();
  await queryClient.invalidateQueries({ queryKey: queryKeys.account.all });
}
