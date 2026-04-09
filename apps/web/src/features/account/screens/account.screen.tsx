"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AccountDesktopScreen } from "./account.screen.desktop";
import { AccountMobileScreen } from "./account.screen.mobile";

export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountScreen(props: AccountScreenProps) {
  return <Responsive mobile={<AccountMobileScreen {...props} />} desktop={<AccountDesktopScreen {...props} />} />;
}
