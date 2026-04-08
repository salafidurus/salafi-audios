"use client";

export type AuthRequiredStateDesktopWebProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
};

export function AuthRequiredStateDesktopWeb({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateDesktopWebProps) {
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
  padding: "4rem 1rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
};

const descriptionStyle: React.CSSProperties = {
  color: "#6b7280",
  marginBottom: "1.5rem",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.5rem 1.5rem",
  backgroundColor: "#2563eb",
  color: "#fff",
  borderRadius: "0.375rem",
  border: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
};
