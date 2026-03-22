"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextInputWeb } from "@sd/shared";
import { AuthProviderButtonWeb } from "../../components/provider-button.web";

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

export function SignUpMobileWebScreen({
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

  const nameField = register("name", { required: true });
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
          <AuthProviderButtonWeb
            provider="apple"
            onClick={termsAccepted ? onSignUpWithApple : undefined}
            disabled={!termsAccepted}
          />
          <AuthProviderButtonWeb
            provider="google"
            onClick={termsAccepted ? onSignUpWithGoogle : undefined}
            disabled={!termsAccepted}
          />
        </div>

        <div style={dividerStyle}>
          <hr style={hrStyle} />
          <span style={dividerTextStyle}>or sign up with email</span>
          <hr style={hrStyle} />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="on"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <TextInputWeb
            placeholder="Name"
            autoComplete="name"
            onBlur={nameField.onBlur}
            name={nameField.name}
            ref={nameField.ref}
            onChange={nameField.onChange}
          />
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
            autoComplete="new-password"
            onBlur={passwordField.onBlur}
            name={passwordField.name}
            ref={passwordField.ref}
            onChange={passwordField.onChange}
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
  background: "var(--screen-wash-primary), var(--surface-canvas)",
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
  borderTop: "1px solid var(--accent-divider, var(--border-default))",
};

const dividerTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--content-muted)",
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
  accentColor: "var(--accent-primary-border, var(--action-primary))",
  cursor: "pointer",
};

const termsTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--content-default)",
  lineHeight: "1.4",
};

const termsLinkStyle: React.CSSProperties = {
  color: "var(--content-primary)",
};
