"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminLivestreamsDesktopWebScreen } from "./admin-livestreams.screen.desktop";
import { AdminLivestreamsMobileWebScreen } from "./admin-livestreams.screen.mobile";

export function AdminLivestreamsScreen() {
  return <Responsive mobile={<AdminLivestreamsMobileWebScreen />} desktop={<AdminLivestreamsDesktopWebScreen />} />;
}
