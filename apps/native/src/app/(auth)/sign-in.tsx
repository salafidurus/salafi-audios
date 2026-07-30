import { routes } from "@sd/core-contracts";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

import { authClient, useAuth } from "@/core/auth";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";

function handleSignInWithGoogle(from: string | undefined) {
  try {
    WebBrowser.dismissAuthSession();
  } catch {
    // Ignore dismiss error if no session is active
  }
  authClient.signIn.social(
    { provider: "google", callbackURL: from ?? "/" },
    {
      onError: (ctx) => {
        console.log("[DEBUG google signIn] onError", ctx.error);
      },
      onSuccess: (ctx) => {
        console.log("[DEBUG google signIn] onSuccess", JSON.stringify(ctx.data));
      },
    },
  );
}

export default function SignInRoute() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { isAuthenticated } = useAuth();
  const { signIn: nativeAppleSignIn, isLoading: appleLoading } = useNativeAppleSignIn();

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
      onSignInWithGoogle={() => handleSignInWithGoogle(from)}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
    />
  );
}
