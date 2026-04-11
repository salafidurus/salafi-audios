import { Platform, useColorScheme } from "react-native";
import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { authClient } from "../../core/auth";
import { SignInScreen } from "../../features/auth/screens/sign-in/sign-in.screen";

export default function SignInRoute() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.home as Href);
  };

  return (
    <SignInScreen
      googleButtonSource={
        Platform.OS === "android"
          ? colorScheme === "dark"
            ? require("../../../assets/auth/google-continue-dark-1x-android.png")
            : require("../../../assets/auth/google-continue-light-1x-android.png")
          : colorScheme === "dark"
            ? require("../../../assets/auth/google-continue-dark-1x-ios.png")
            : require("../../../assets/auth/google-continue-light-1x-ios.png")
      }
      onBack={handleBack}
      onSignIn={async (email, password) => {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Sign in failed");
        router.replace(routes.home as Href);
      }}
      onSignInWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignInWithApple={() => authClient.signIn.social({ provider: "apple" })}
      onNavigateToSignUp={() => router.push(routes.signUp)}
    />
  );
}
