"use client";

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

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Sign In</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button type="button" onClick={onSignInWithApple} style={appleBtnStyle}>
            <img
              src="/auth/apple-logo-dark-1x.png"
              srcSet="/auth/apple-logo-dark-1x.png 1x, /auth/apple-logo-dark-3x.png 3x"
              width={24}
              height={28}
              alt=""
              aria-hidden
              style={providerIconStyle}
            />
            Continue with Apple
          </button>
          <button type="button" onClick={onSignInWithGoogle} style={googleBtnStyle}>
            <img
              src="/auth/google-logo-light-1x.png"
              srcSet="/auth/google-logo-light-1x.png 1x, /auth/google-logo-light-4x.png 4x"
              width={24}
              height={24}
              alt=""
              aria-hidden
              style={providerIconStyle}
            />
            Continue with Google
          </button>
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
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              autoCapitalize="none"
              style={{
                ...inputStyle,
                borderColor: errors.email ? "var(--state-danger)" : "var(--border-default)",
              }}
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
            {errors.email?.message && <p style={fieldErrorStyle}>{errors.email.message}</p>}
          </div>
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            style={inputStyle}
            {...register("password", { required: true })}
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
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  width: "100%",
  maxWidth: 360,
};

const titleStyle: React.CSSProperties = {
  fontSize: "var(--typo-title-md-font-size)",
  fontWeight: "var(--typo-title-md-font-weight)" as React.CSSProperties["fontWeight"],
  fontFamily: "var(--typo-title-md-font-family)",
  textAlign: "center",
  margin: 0,
  color: "var(--content-strong)",
};

const appleBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "12px 16px",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
};

const googleBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "12px 16px",
  background: "#fff",
  color: "#1F1F1F",
  border: "1px solid #747775",
  borderRadius: 8,
  fontSize: 16,
  fontFamily: "Roboto, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
};

const providerIconStyle: React.CSSProperties = {
  display: "block",
  flexShrink: 0,
  objectFit: "contain",
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
  color: "var(--content-muted)",
  whiteSpace: "nowrap",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
  background: "var(--surface-subtle)",
  color: "var(--content-default)",
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
  background: "var(--action-primary)",
  color: "var(--content-on-primary,#fff)",
  border: "none",
  borderRadius: 8,
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
