"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LibraryCompletedDesktopScreen } from "./library-completed.screen.desktop";
import { LibraryCompletedMobileScreen } from "./library-completed.screen.mobile";

export type LibraryCompletedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryCompletedScreen(props: LibraryCompletedScreenProps) {
  return <Responsive mobile={<LibraryCompletedMobileScreen {...props} />} desktop={<LibraryCompletedDesktopScreen {...props} />} />;
}
