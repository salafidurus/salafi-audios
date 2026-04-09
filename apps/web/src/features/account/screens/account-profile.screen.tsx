"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AccountProfileDesktopScreen } from "./account-profile.screen.desktop";
import { AccountProfileMobileScreen } from "./account-profile.screen.mobile";

export type AccountProfileScreenProps = {
  onBack?: () => void;
};

export function AccountProfileScreen(props: AccountProfileScreenProps) {
  return <Responsive mobile={<AccountProfileMobileScreen {...props} />} desktop={<AccountProfileDesktopScreen {...props} />} />;
}
