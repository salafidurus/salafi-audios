"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LectureDetailDesktopWebScreen } from "./lecture-detail.screen.desktop";
import { LectureDetailMobileWebScreen } from "./lecture-detail.screen.mobile";

export type LectureDetailScreenProps = {
  id: string;
};

export function LectureDetailScreen(props: LectureDetailScreenProps) {
  return <Responsive mobile={<LectureDetailMobileWebScreen {...props} />} desktop={<LectureDetailDesktopWebScreen {...props} />} />;
}
