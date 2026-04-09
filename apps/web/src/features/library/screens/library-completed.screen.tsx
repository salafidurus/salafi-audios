"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibraryCompletedDesktopWebScreen } from "./library-completed.screen.desktop";
import { LibraryCompletedMobileWebScreen } from "./library-completed.screen.mobile";

export type LibraryCompletedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryCompletedScreen(props: LibraryCompletedScreenProps) {
  return <Responsive mobile={<LibraryCompletedMobileWebScreen {...props} />} desktop={<LibraryCompletedDesktopWebScreen {...props} />} />;
}
