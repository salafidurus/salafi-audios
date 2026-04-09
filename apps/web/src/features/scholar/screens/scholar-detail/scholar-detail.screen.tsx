"use client";

import { Responsive } from "@/shared/components/Responsive";
import { ScholarDetailDesktopScreen } from "./scholar-detail.screen.desktop";
import { ScholarDetailMobileScreen } from "./scholar-detail.screen.mobile";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen(props: ScholarDetailScreenProps) {
  return <Responsive mobile={<ScholarDetailMobileScreen {...props} />} desktop={<ScholarDetailDesktopScreen {...props} />} />;
}
