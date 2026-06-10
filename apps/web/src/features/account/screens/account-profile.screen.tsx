"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AccountProfileDesktopScreen } from "./account-profile.screen.desktop";
import { AccountProfileMobileScreen } from "./account-profile.screen.mobile";

export type AccountProfileScreenProps = {
  onBack?: () => void;
};

export function AccountProfileScreen(props: AccountProfileScreenProps) {
  const mobile = <AccountProfileMobileScreen {...props} />;
  const desktop = <AccountProfileDesktopScreen {...props} />;
  // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
