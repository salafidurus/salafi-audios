import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export type SignUpScreenProps = {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onNavigateToSignIn: () => void;
};

export function SignUpScreen({ onSignUp, onNavigateToSignIn }: SignUpScreenProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit({ name, email, password }: FormValues) {
    setLoading(true);
    setError("");
    try {
      await onSignUp(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="Name" {...register("name", { required: true })} />
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
          Create Account
        </button>
      </form>
      <button type="button" onClick={onNavigateToSignIn}>
        Already have an account? Sign in
      </button>
    </div>
  );
}
