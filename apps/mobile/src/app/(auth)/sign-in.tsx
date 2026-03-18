import { useRouter } from "expo-router";
import { SignInScreen } from "@sd/ui-mobile";
import { authClient } from "@/core/auth/auth-client";

export default function SignInPage() {
  const router = useRouter();

  return (
    <SignInScreen
      googleLogoSource={require("../../../assets/auth/google-logo-light-1x.png")}
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
