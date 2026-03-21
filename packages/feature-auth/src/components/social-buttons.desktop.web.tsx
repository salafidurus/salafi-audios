"use client";

import { AuthProviderButtonWeb } from "./provider-button.web";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onClick, disabled }: Props) {
  return <AuthProviderButtonWeb provider="google" onClick={onClick} disabled={disabled} />;
}

export function AppleSignInButton({ onClick, disabled }: Props) {
  return <AuthProviderButtonWeb provider="apple" onClick={onClick} disabled={disabled} />;
}
