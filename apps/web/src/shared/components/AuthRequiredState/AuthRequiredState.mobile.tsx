"use client";

export type AuthRequiredStateMobileWebProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
};

export function AuthRequiredStateMobileWeb({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateMobileWebProps) {
  return (
    <div style={wrapperStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <p style={descriptionStyle}>{description}</p>
      <button type="button" onClick={onPress} style={buttonStyle}>
        {actionLabel}
      </button>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "3rem 1rem 2rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
};

const descriptionStyle: React.CSSProperties = {
  color: "#6b7280",
  marginBottom: "1.25rem",
  fontSize: "0.9375rem",
  lineHeight: 1.5,
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.75rem 1.5rem",
  backgroundColor: "#2563eb",
  color: "#fff",
  borderRadius: "0.5rem",
  border: "none",
  fontWeight: 600,
  fontSize: "0.9375rem",
  cursor: "pointer",
};
