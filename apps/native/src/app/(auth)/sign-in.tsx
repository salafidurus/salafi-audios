import { routes } from "@sd/core-contracts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/core/auth";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";
import { useNativeGoogleSignIn } from "@/features/auth/hooks/use-native-google-sign-in";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

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
        router.replace(from);
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
