"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminTopicsDesktopScreen } from "./admin-topics.screen.desktop";
import { AdminTopicsMobileScreen } from "./admin-topics.screen.mobile";

export function AdminTopicsScreen() {
  return <Responsive mobile={<AdminTopicsMobileScreen />} desktop={<AdminTopicsDesktopScreen />} />;
}
