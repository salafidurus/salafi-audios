"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibraryDesktopScreen } from "./library.screen.desktop";
import { LibraryMobileScreen } from "./library.screen.mobile";

export type LibraryScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryScreen(props: LibraryScreenProps) {
  const mobile = <LibraryMobileScreen {...props} />;
  const desktop = <LibraryDesktopScreen {...props} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
