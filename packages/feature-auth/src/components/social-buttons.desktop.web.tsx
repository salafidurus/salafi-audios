"use client";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        width: "100%",
        padding: "0.625rem 1rem",
        background: "#FFFFFF",
        color: "#1F1F1F",
        border: "1px solid #747775",
        borderRadius: "0.375rem",
        fontSize: "0.9375rem",
        fontFamily: "Roboto, sans-serif",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 160ms ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#f8f8f8";
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
      }}
    >
      <img
        src="/auth/google-logo-light-1x.png"
        srcSet="/auth/google-logo-light-1x.png 1x, /auth/google-logo-light-4x.png 4x"
        width={18}
        height={18}
        alt=""
        aria-hidden="true"
      />
      Continue with Google
    </button>
  );
}

export function AppleSignInButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        width: "100%",
        padding: "0.625rem 1rem",
        background: "#000000",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "0.375rem",
        fontSize: "0.9375rem",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 160ms ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#1a1a1a";
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#000000";
      }}
    >
      <img
        src="/auth/apple-logo-dark-1x.png"
        srcSet="/auth/apple-logo-dark-1x.png 1x, /auth/apple-logo-dark-3x.png 3x"
        width={16}
        height={20}
        alt=""
        aria-hidden="true"
      />
      Continue with Apple
    </button>
  );
}
