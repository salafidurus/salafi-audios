"use client";

import { Button } from "@/shared/components/Button/Button";

export type AuthRequiredStateDesktopProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
};

export function AuthRequiredStateDesktop({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateDesktopProps) {
  return (
    <div style={wrapperStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <p style={descriptionStyle}>{description}</p>
      <Button variant="primary" onClick={onPress}>
        {actionLabel}
      </Button>
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
  color: "var(--content-muted)",
  marginBottom: "1.5rem",
};
