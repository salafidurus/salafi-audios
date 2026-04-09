"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibrarySavedDesktopWebScreen } from "./library-saved.screen.desktop";
import { LibrarySavedMobileWebScreen } from "./library-saved.screen.mobile";

export type LibrarySavedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedScreen(props: LibrarySavedScreenProps) {
  return <Responsive mobile={<LibrarySavedMobileWebScreen {...props} />} desktop={<LibrarySavedDesktopWebScreen {...props} />} />;
}
