"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibrarySavedDesktopWebScreen } from "./library-saved.screen.desktop";
import { LibrarySavedMobileWebScreen } from "./library-saved.screen.mobile";

export type LibraryScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryScreen(props: LibraryScreenProps) {
  return <Responsive mobile={<LibrarySavedMobileWebScreen {...props} />} desktop={<LibrarySavedDesktopWebScreen {...props} />} />;
}
