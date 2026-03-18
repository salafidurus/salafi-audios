import { useRouter } from "expo-router";
import { SignUpScreen } from "@sd/ui-mobile";
import { authClient } from "@/core/auth/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <SignUpScreen
      onSignUp={async (name, email, password) => {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? "Sign up failed");
        router.replace("/");
      }}
      onNavigateToSignIn={() => router.push("/sign-in")}
    />
  );
}
