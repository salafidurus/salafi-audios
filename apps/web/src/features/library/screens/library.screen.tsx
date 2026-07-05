"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibraryDesktopScreen } from "./library.screen.desktop";
import { LibraryMobileScreen } from "./library.screen.mobile";

export function LibraryScreen() {
  const mobile = <LibraryMobileScreen />;
  const desktop = <LibraryDesktopScreen />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
