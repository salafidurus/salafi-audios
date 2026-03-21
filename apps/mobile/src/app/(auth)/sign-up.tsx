import { useRouter } from "expo-router";
import { SignUpMobileNativeScreen, authClient } from "@sd/feature-auth";

export default function SignUpPage() {
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  return (
    <SignUpMobileNativeScreen
      googleLogoSource={require("../../../assets/auth/google-logo-light-1x.png")}
      onBack={handleBack}
      onSignUp={async (name, email, password) => {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? "Sign up failed");
        router.replace("/");
      }}
      onSignUpWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignUpWithApple={() => authClient.signIn.social({ provider: "apple" })}
      onNavigateToSignIn={() => router.push("/sign-in")}
    />
  );
}
