"use client";

import { Responsive } from "@/shared/components/Responsive";
import { ScholarDetailDesktopScreen } from "./scholar-detail.screen.desktop";
import { ScholarDetailMobileScreen } from "./scholar-detail.screen.mobile";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen(props: ScholarDetailScreenProps) {
  const mobile = <ScholarDetailMobileScreen {...props} />;
  const desktop = <ScholarDetailDesktopScreen {...props} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
