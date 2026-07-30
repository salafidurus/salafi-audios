import { routes } from "@sd/core-contracts";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/core/auth";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";
import { useNativeGoogleSignIn } from "@/features/auth/hooks/use-native-google-sign-in";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

export default function SignInRoute() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { isAuthenticated } = useAuth();
  const { signIn: nativeAppleSignIn, isLoading: appleLoading } = useNativeAppleSignIn();
  const { signIn: nativeGoogleSignIn, isLoading: googleLoading } = useNativeGoogleSignIn();

  useEffect(() => {
    if (isAuthenticated) {
      if (from) {
        router.replace(from as Href);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(routes.home as Href);
      }
    }
  }, [isAuthenticated, from, router]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.home as Href);
  };

  return (
    <SignInScreen
      onBack={handleBack}
      onSignInWithGoogle={() => nativeGoogleSignIn()}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
      googleLoading={googleLoading}
    />
  );
}
