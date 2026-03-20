"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export type SignUpScreenProps = {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onSignUpWithGoogle: () => void;
  onSignUpWithApple: () => void;
  onNavigateToSignIn: () => void;
};

export function SignUpScreen({
  onSignUp,
  onSignUpWithGoogle,
  onSignUpWithApple,
  onNavigateToSignIn,
}: SignUpScreenProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
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
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Create Account</h1>

        <label style={termsRowStyle}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            style={checkboxStyle}
          />
          <span style={termsTextStyle}>
            I agree to the <span style={termsLinkStyle}>Terms of Service</span> and{" "}
            <span style={termsLinkStyle}>Privacy Policy</span>
          </span>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={termsAccepted ? onSignUpWithApple : undefined}
            disabled={!termsAccepted}
            style={{
              ...appleBtnStyle,
              opacity: termsAccepted ? 1 : 0.45,
              cursor: termsAccepted ? "pointer" : "not-allowed",
            }}
          >
            <img
              src="/auth/apple-logo-dark-1x.png"
              srcSet="/auth/apple-logo-dark-1x.png 1x, /auth/apple-logo-dark-3x.png 3x"
              width={20}
              height={24}
              alt=""
              aria-hidden
            />
            Continue with Apple
          </button>
          <button
            type="button"
            onClick={termsAccepted ? onSignUpWithGoogle : undefined}
            disabled={!termsAccepted}
            style={{
              ...googleBtnStyle,
              opacity: termsAccepted ? 1 : 0.45,
              cursor: termsAccepted ? "pointer" : "not-allowed",
            }}
          >
            <img
              src="/auth/google-logo-light-1x.png"
              srcSet="/auth/google-logo-light-1x.png 1x, /auth/google-logo-light-4x.png 4x"
              width={22}
              height={22}
              alt=""
              aria-hidden
            />
            Continue with Google
          </button>
        </div>

        <div style={dividerStyle}>
          <hr style={hrStyle} />
          <span style={dividerTextStyle}>or sign up with email</span>
          <hr style={hrStyle} />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input placeholder="Name" style={inputStyle} {...register("name", { required: true })} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <input
              type="email"
              placeholder="Email"
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
            style={inputStyle}
            {...register("password", { required: true })}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !termsAccepted || !isValid}
            style={{
              ...submitBtnStyle,
              opacity: termsAccepted && isValid ? 1 : 0.45,
              cursor: termsAccepted && isValid ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <button type="button" onClick={onNavigateToSignIn} style={linkBtnStyle}>
          Already have an account? Sign in
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

const termsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  marginTop: 1,
  flexShrink: 0,
  accentColor: "var(--action-primary)",
  cursor: "pointer",
};

const termsTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--content-muted)",
  lineHeight: "1.4",
};

const termsLinkStyle: React.CSSProperties = {
  color: "var(--content-primary)",
};
