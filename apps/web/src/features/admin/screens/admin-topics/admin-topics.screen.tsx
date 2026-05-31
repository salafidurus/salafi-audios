"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminTopicsDesktopScreen } from "./admin-topics.screen.desktop";
import { AdminTopicsMobileScreen } from "./admin-topics.screen.mobile";

export function AdminTopicsScreen() {
  const mobile = <AdminTopicsMobileScreen />;
  const desktop = <AdminTopicsDesktopScreen />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
