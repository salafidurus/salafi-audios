import { Platform, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { SignUpMobileNativeScreen, authClient } from "@sd/feature-auth";
import { routes } from "@sd/core-contracts";

export default function SignUpPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.home);
  };

  return (
    <SignUpMobileNativeScreen
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
      onSignUp={async (name, email, password) => {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? "Sign up failed");
        router.replace(routes.home);
      }}
      onSignUpWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignUpWithApple={() => authClient.signIn.social({ provider: "apple" })}
      onNavigateToSignIn={() => router.push(routes.signIn)}
    />
  );
}
