import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth";
import { SignInScreen } from "@/features/auth/screens/sign-in/sign-in.screen";
import { useNativeAppleSignIn } from "@/features/auth/hooks/use-native-apple-sign-in";

export default function SignInRoute() {
  const router = useRouter();
  const { signIn: nativeAppleSignIn, isLoading: appleLoading } = useNativeAppleSignIn();

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
      onSignInWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignInWithApple={() => nativeAppleSignIn()}
      appleLoading={appleLoading}
    />
  );
}
