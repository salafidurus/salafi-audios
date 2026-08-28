import { routes } from "@sd/core-contracts";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/core/auth";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";
import { useNativeGoogleSignIn } from "@/features/auth/hooks/use-native-google-sign-in";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

/** Provides the native app (auth) sign-in module responsibility. */
/** Describes the SignInRoute native function contract and behavior. */
export default function SignInRoute() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { isAuthenticated } = useAuth();
  const {
    signIn: nativeAppleSignIn,
    isLoading: appleLoading,
    error: appleError,
  } = useNativeAppleSignIn();
  const {
    signIn: nativeGoogleSignIn,
    isLoading: googleLoading,
    error: googleError,
  } = useNativeGoogleSignIn();

  const fallbackPath = routes.home;

  useEffect(() => {
    if (isAuthenticated) {
      if (from) {
        // SAFETY: `from` is produced by this app's same-origin route query.
        router.replace(from as Href);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(fallbackPath);
      }
    }
  }, [fallbackPath, isAuthenticated, from, router]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackPath);
  };

  return (
    <SignInScreen
      onBack={handleBack}
      onSignInWithGoogle={() => nativeGoogleSignIn()}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
      googleLoading={googleLoading}
      appleError={appleError}
      googleError={googleError}
    />
  );
}
