"use client";

import { Responsive } from "@/shared/components/Responsive";
import { ScholarDetailDesktopWebScreen } from "./scholar-detail.screen.desktop";
import { ScholarDetailMobileWebScreen } from "./scholar-detail.screen.mobile";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen(props: ScholarDetailScreenProps) {
  return <Responsive mobile={<ScholarDetailMobileWebScreen {...props} />} desktop={<ScholarDetailDesktopWebScreen {...props} />} />;
}
