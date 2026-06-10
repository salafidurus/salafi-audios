"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibraryCompletedDesktopScreen } from "./library-completed.screen.desktop";
import { LibraryCompletedMobileScreen } from "./library-completed.screen.mobile";

export type LibraryCompletedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryCompletedScreen(props: LibraryCompletedScreenProps) {
  const mobile = <LibraryCompletedMobileScreen {...props} />;
  const desktop = <LibraryCompletedDesktopScreen {...props} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
