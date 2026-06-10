"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibrarySavedDesktopScreen } from "./library-saved.screen.desktop";
import { LibrarySavedMobileScreen } from "./library-saved.screen.mobile";

export type LibrarySavedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedScreen(props: LibrarySavedScreenProps) {
  const mobile = <LibrarySavedMobileScreen {...props} />;
  const desktop = <LibrarySavedDesktopScreen {...props} />;
  // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
