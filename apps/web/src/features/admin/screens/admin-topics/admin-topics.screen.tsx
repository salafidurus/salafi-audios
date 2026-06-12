"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminTopicsDesktopScreen } from "./admin-topics.screen.desktop";
import { AdminTopicsMobileScreen } from "./admin-topics.screen.mobile";

const MOBILE = <AdminTopicsMobileScreen />;
const DESKTOP = <AdminTopicsDesktopScreen />;

export function AdminTopicsScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
