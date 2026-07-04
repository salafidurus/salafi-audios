"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibraryCompletedDesktopScreen } from "./library-completed.screen.desktop";
import { LibraryCompletedMobileScreen } from "./library-completed.screen.mobile";

export function LibraryCompletedScreen() {
  const mobile = <LibraryCompletedMobileScreen />;
  const desktop = <LibraryCompletedDesktopScreen />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
