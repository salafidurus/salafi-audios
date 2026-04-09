"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibrarySavedDesktopScreen } from "./library-saved.screen.desktop";
import { LibrarySavedMobileScreen } from "./library-saved.screen.mobile";

export type LibraryScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryScreen(props: LibraryScreenProps) {
  return <Responsive mobile={<LibrarySavedMobileScreen {...props} />} desktop={<LibrarySavedDesktopScreen {...props} />} />;
}
