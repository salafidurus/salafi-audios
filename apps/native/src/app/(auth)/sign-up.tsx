import { Platform, useColorScheme } from "react-native";
import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { authClient } from "@/core/auth";
import { SignUpScreen } from "@/features/auth/screens/sign-up/sign-up.screen";

export default function SignUpRoute() {
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
    <SignUpScreen
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
      onSignUpWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignUpWithApple={() => authClient.signIn.social({ provider: "apple" })}
      onNavigateToSignIn={() => router.push(routes.signIn)}
    />
  );
}
