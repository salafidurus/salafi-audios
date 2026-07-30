import { routes } from "@sd/core-contracts";
import { type Href, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

import { authClient, useAuth } from "@/core/auth";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

function handleSignInWithGoogle() {
  try {
    WebBrowser.dismissAuthSession();
  } catch {
    // Ignore dismiss error if no session is active
  }
  void authClient.signIn.social({ provider: "google", callbackURL: "/" });
}

export default function SignInRoute() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { signIn: nativeAppleSignIn, isLoading: appleLoading } = useNativeAppleSignIn();

  useEffect(() => {
    if (isAuthenticated) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(routes.home as Href);
      }
    }
  }, [isAuthenticated, router]);

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
      onSignInWithGoogle={handleSignInWithGoogle}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
    />
  );
}
