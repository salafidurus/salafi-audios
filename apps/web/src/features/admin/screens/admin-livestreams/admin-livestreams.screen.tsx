"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminLivestreamsDesktopScreen } from "./admin-livestreams.screen.desktop";
import { AdminLivestreamsMobileScreen } from "./admin-livestreams.screen.mobile";

export function AdminLivestreamsScreen() {
  return <Responsive mobile={<AdminLivestreamsMobileScreen />} desktop={<AdminLivestreamsDesktopScreen />} />;
}
