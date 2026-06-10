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
  const mobile = <AccountMobileScreen {...props} />;
  const desktop = <AccountDesktopScreen {...props} />;
  // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
