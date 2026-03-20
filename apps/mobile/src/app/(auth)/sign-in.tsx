import { useRouter } from "expo-router";
import { SignInScreen, authClient } from "@sd/feature-auth";

export default function SignInPage() {
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  return (
    <SignInScreen
      googleLogoSource={require("../../../assets/auth/google-logo-light-1x.png")}
      onBack={handleBack}
      onSignIn={async (email, password) => {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Sign in failed");
        router.replace("/");
      }}
      onSignInWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignInWithApple={() => authClient.signIn.social({ provider: "apple" })}
      onNavigateToSignUp={() => router.push("/sign-up")}
    />
  );
}
