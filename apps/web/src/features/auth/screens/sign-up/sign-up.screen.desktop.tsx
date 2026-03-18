"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/core/auth/auth-client";
import { GoogleSignInButton, AppleSignInButton } from "@/features/auth/components/social-buttons";

export function SignUpDesktopScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = emailTouched && email.length > 0 && !isEmailValid;
  const canSubmit = termsAccepted && isEmailValid && name.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign up failed");
      return;
    }
    router.push(redirectTo);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <div className="flex w-full max-w-[22rem] flex-col gap-6">
        <h1
          className="text-center text-[var(--content-strong)]"
          style={{
            fontFamily: "var(--typo-title-md-font-family)",
            fontSize: "var(--typo-title-md-font-size)",
            fontWeight: "var(--typo-title-md-font-weight)",
            lineHeight: "var(--typo-title-md-line-height)",
          }}
        >
          Create Account
        </h1>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--action-primary)]"
          />
          <span
            className="text-[var(--content-muted)]"
            style={{ fontSize: "var(--typo-body-sm-font-size)", lineHeight: "1.4" }}
          >
            I agree to the <span className="text-[var(--content-primary)]">Terms of Service</span>{" "}
            and <span className="text-[var(--content-primary)]">Privacy Policy</span>
          </span>
        </label>

        <div className="flex flex-col gap-3">
          <AppleSignInButton
            onClick={() => authClient.signIn.social({ provider: "apple", callbackURL: redirectTo })}
            disabled={!termsAccepted}
          />
          <GoogleSignInButton
            onClick={() =>
              authClient.signIn.social({ provider: "google", callbackURL: redirectTo })
            }
            disabled={!termsAccepted}
          />
        </div>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-[var(--border-default)]" />
          <span
            className="text-[var(--content-muted)]"
            style={{ fontSize: "var(--typo-body-sm-font-size)" }}
          >
            or sign up with email
          </span>
          <hr className="flex-1 border-[var(--border-default)]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-2.5 text-[var(--content-default)] placeholder:text-[var(--content-muted)] focus:border-[var(--border-focus)] focus:outline-none"
            style={{ fontSize: "var(--typo-body-md-font-size)" }}
          />
          <div className="flex flex-col gap-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Email"
              required
              className={`w-full rounded-md border bg-[var(--surface-subtle)] px-3 py-2.5 text-[var(--content-default)] placeholder:text-[var(--content-muted)] focus:outline-none ${showEmailError ? "border-[var(--state-danger)] focus:border-[var(--state-danger)]" : "border-[var(--border-default)] focus:border-[var(--border-focus)]"}`}
              style={{ fontSize: "var(--typo-body-md-font-size)" }}
            />
            {showEmailError && (
              <p
                className="text-[var(--state-danger-content)]"
                style={{ fontSize: "var(--typo-body-xs-font-size)" }}
                role="alert"
              >
                Please enter a valid email address.
              </p>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-2.5 text-[var(--content-default)] placeholder:text-[var(--content-muted)] focus:border-[var(--border-focus)] focus:outline-none"
            style={{ fontSize: "var(--typo-body-md-font-size)" }}
          />

          {error && (
            <p className="text-sm text-[var(--state-danger-content)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-md bg-[var(--action-primary)] px-3 py-2.5 font-semibold text-[var(--content-on-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
            style={{ fontSize: "var(--typo-body-md-font-size)" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p
          className="text-center text-[var(--content-muted)]"
          style={{ fontSize: "var(--typo-body-sm-font-size)" }}
        >
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--content-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
