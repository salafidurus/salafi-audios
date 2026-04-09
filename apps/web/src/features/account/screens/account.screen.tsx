"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AccountDesktopWebScreen } from "./account.screen.desktop";
import { AccountMobileWebScreen } from "./account.screen.mobile";

export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountScreen(props: AccountScreenProps) {
  return <Responsive mobile={<AccountMobileWebScreen {...props} />} desktop={<AccountDesktopWebScreen {...props} />} />;
}
