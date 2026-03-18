import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  email: string;
  password: string;
};

export type SignInScreenProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onNavigateToSignUp: () => void;
};

export function SignInScreen({
  onSignIn,
  onSignInWithGoogle,
  onNavigateToSignUp,
}: SignInScreenProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit({ email, password }: FormValues) {
    setLoading(true);
    setError("");
    try {
      await onSignIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={onSignInWithGoogle}>
        Continue with Google
      </button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Email"
          autoCapitalize="none"
          {...register("email", { required: true })}
        />
        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: true })}
        />
        {error && <p>{error}</p>}
        <button type="submit" disabled={loading}>
          Sign In
        </button>
      </form>
      <button type="button" onClick={onNavigateToSignUp}>
        Don&apos;t have an account? Create one
      </button>
    </div>
  );
}
