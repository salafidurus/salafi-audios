"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminLivestreamsDesktopScreen } from "./admin-livestreams.screen.desktop";
import { AdminLivestreamsMobileScreen } from "./admin-livestreams.screen.mobile";

export function AdminLivestreamsScreen() {
  const mobile = <AdminLivestreamsMobileScreen />;
  const desktop = <AdminLivestreamsDesktopScreen />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
