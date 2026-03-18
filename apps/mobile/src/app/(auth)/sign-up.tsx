import { useRouter } from "expo-router";
import { SignUpScreen } from "@sd/ui-mobile";
import { authClient } from "@/core/auth/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <SignUpScreen
      googleLogoSource={require("@/assets/auth/google-logo-light-1x.png")}
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
