/** Documents this module's responsibility and public boundary. */
"use client";

import { AuthProviderButton } from "./provider-button";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

/** Adapts the shared provider button to the Google sign-in action. */
export function GoogleSignInButton({ onClick, disabled }: Props) {
  return <AuthProviderButton provider="google" onClick={onClick} disabled={disabled} />;
}

/** Adapts the shared provider button to the Apple sign-in action. */
export function AppleSignInButton({ onClick, disabled }: Props) {
  return <AuthProviderButton provider="apple" onClick={onClick} disabled={disabled} />;
}
