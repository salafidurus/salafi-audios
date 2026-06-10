"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminLecturesDesktopScreen } from "./admin-lectures.screen.desktop";
import { AdminLecturesMobileScreen } from "./admin-lectures.screen.mobile";

const MOBILE = <AdminLecturesMobileScreen />;
const DESKTOP = <AdminLecturesDesktopScreen />;

export function AdminLecturesScreen() {
  return <Responsive mobile={MOBILE} desktop={DESKTOP} />;
}
