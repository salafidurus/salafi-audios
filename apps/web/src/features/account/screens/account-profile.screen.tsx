"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AccountProfileDesktopWebScreen } from "./account-profile.screen.desktop";
import { AccountProfileMobileWebScreen } from "./account-profile.screen.mobile";

export type AccountProfileScreenProps = {
  onBack?: () => void;
};

export function AccountProfileScreen(props: AccountProfileScreenProps) {
  return <Responsive mobile={<AccountProfileMobileWebScreen {...props} />} desktop={<AccountProfileDesktopWebScreen {...props} />} />;
}
