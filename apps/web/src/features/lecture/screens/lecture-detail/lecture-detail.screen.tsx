"use client";

import { Responsive } from "@/shared/components/Responsive";
import { LectureDetailDesktopScreen } from "./lecture-detail.screen.desktop";
import { LectureDetailMobileScreen } from "./lecture-detail.screen.mobile";

export type LectureDetailScreenProps = {
  id: string;
};

export function LectureDetailScreen(props: LectureDetailScreenProps) {
  const mobile = <LectureDetailMobileScreen {...props} />;
  const desktop = <LectureDetailDesktopScreen {...props} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
