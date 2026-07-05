"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibrarySavedDesktopScreen } from "./library-saved.screen.desktop";
import { LibrarySavedMobileScreen } from "./library-saved.screen.mobile";

export function LibrarySavedScreen() {
  const mobile = <LibrarySavedMobileScreen />;
  const desktop = <LibrarySavedDesktopScreen />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
