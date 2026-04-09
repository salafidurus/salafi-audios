"use client";

import { AuthProviderButton } from "./provider-button";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onClick, disabled }: Props) {
  return <AuthProviderButton provider="google" onClick={onClick} disabled={disabled} />;
}

export function AppleSignInButton({ onClick, disabled }: Props) {
  return <AuthProviderButton provider="apple" onClick={onClick} disabled={disabled} />;
}
