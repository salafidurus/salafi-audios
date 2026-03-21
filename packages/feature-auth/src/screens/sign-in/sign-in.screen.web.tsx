"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextInputWeb } from "@sd/shared";
import { AuthProviderButtonWeb } from "../../components/provider-button.web";

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

export function SignInMobileWebScreen({
  onSignIn,
  onSignInWithGoogle,
  onSignInWithApple,
  onNavigateToSignUp,
}: SignInScreenProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
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

  const emailField = register("email", {
    required: true,
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address.",
    },
  });
  const passwordField = register("password", { required: true });

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Sign In</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AuthProviderButtonWeb provider="apple" onClick={onSignInWithApple} />
          <AuthProviderButtonWeb provider="google" onClick={onSignInWithGoogle} />
        </div>

        <div style={dividerStyle}>
          <hr style={hrStyle} />
          <span style={dividerTextStyle}>or continue with email</span>
          <hr style={hrStyle} />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="on"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <TextInputWeb
              type="email"
              placeholder="Email"
              autoComplete="email"
              autoCapitalize="none"
              invalid={Boolean(errors.email)}
              onBlur={emailField.onBlur}
              name={emailField.name}
              ref={emailField.ref}
              onChange={emailField.onChange}
            />
            {errors.email?.message && <p style={fieldErrorStyle}>{errors.email.message}</p>}
          </div>
          <TextInputWeb
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            onBlur={passwordField.onBlur}
            name={passwordField.name}
            ref={passwordField.ref}
            onChange={passwordField.onChange}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !isValid}
            style={{
              ...submitBtnStyle,
              opacity: isValid ? 1 : 0.45,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <button type="button" onClick={onNavigateToSignUp} style={linkBtnStyle}>
          Don&apos;t have an account? Create one
        </button>
      </div>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  display: "flex",
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  minHeight: "100%",
  background:
    "radial-gradient(circle at 12% 14%, var(--surface-primary-subtle), transparent 42%), var(--surface-canvas)",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  width: "100%",
  maxWidth: 360,
  padding: 20,
  borderRadius: 24,
  background: "var(--accent-mixed-surface, var(--surface-default))",
  border: "1px solid var(--accent-mixed-border, var(--border-default))",
  boxShadow: "var(--shadow-md)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "var(--typo-title-md-font-size)",
  fontWeight: "var(--typo-title-md-font-weight)" as React.CSSProperties["fontWeight"],
  fontFamily: "var(--typo-title-md-font-family)",
  textAlign: "center",
  margin: 0,
  color: "var(--content-primary)",
};

const dividerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const hrStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  borderTop: "1px solid var(--border-default)",
};

const dividerTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--content-primary)",
  whiteSpace: "nowrap",
};

const errorStyle: React.CSSProperties = {
  color: "var(--state-danger)",
  fontSize: 14,
  margin: 0,
};

const fieldErrorStyle: React.CSSProperties = {
  color: "var(--state-danger-content)",
  fontSize: 12,
  margin: 0,
};

const submitBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "var(--accent-primary-bg, var(--action-primary))",
  color: "var(--accent-primary-fg, var(--content-on-primary))",
  border: "1px solid var(--accent-primary-border, var(--action-primary))",
  boxShadow: "var(--shadow-sm)",
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
};

const linkBtnStyle: React.CSSProperties = {
  textAlign: "center",
  color: "var(--content-primary)",
  fontSize: 14,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
