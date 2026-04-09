"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminTopicsDesktopWebScreen } from "./admin-topics.screen.desktop";
import { AdminTopicsMobileWebScreen } from "./admin-topics.screen.mobile";

export function AdminTopicsScreen() {
  return <Responsive mobile={<AdminTopicsMobileWebScreen />} desktop={<AdminTopicsDesktopWebScreen />} />;
}
