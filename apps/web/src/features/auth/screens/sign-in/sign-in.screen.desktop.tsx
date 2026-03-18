"use client";

import { authClient } from "@/core/auth/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export function SignInDesktopScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign in failed");
      return;
    }
    router.push(redirectTo);
  }

  async function handleGoogleSignIn() {
    await authClient.signIn.social({ provider: "google", callbackURL: redirectTo });
  }

  async function handleAppleSignIn() {
    await authClient.signIn.social({ provider: "apple", callbackURL: redirectTo });
  }

  return (
    <div>
      <form onSubmit={handleEmailSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p>{error}</p>}
        <button type="submit" disabled={loading}>
          Sign in
        </button>
      </form>
      <button onClick={handleGoogleSignIn}>Continue with Google</button>
      <button onClick={handleAppleSignIn}>Continue with Apple</button>
      <Link href="/sign-up">Create account</Link>
    </div>
  );
}
