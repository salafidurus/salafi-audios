"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminLivestreamsDesktopScreen } from "./admin-livestreams.screen.desktop";
import { AdminLivestreamsMobileScreen } from "./admin-livestreams.screen.mobile";

const MOBILE = <AdminLivestreamsMobileScreen />;
const DESKTOP = <AdminLivestreamsDesktopScreen />;

export function AdminLivestreamsScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
