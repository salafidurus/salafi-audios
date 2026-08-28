/** Provides the copy and action used when a mobile user must authenticate. */
"use client";

import { Button } from "@/shared/components/ui/button";

/** Configures the mobile authentication-required empty state. */
export type AuthRequiredStateMobileProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
};

/** Renders a mobile-sized sign-in prompt for protected content. */
export function AuthRequiredStateMobile({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateMobileProps) {
  return (
    <div style={wrapperStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <p style={descriptionStyle}>{description}</p>
      <Button variant="primary" size="lg" onClick={onPress}>
        {actionLabel}
      </Button>
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
  color: "var(--content-muted)",
  marginBottom: "1.25rem",
  fontSize: "0.9375rem",
  lineHeight: 1.5,
};
