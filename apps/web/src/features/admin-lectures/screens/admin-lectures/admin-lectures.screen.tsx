"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminLecturesDesktopScreen } from "./admin-lectures.screen.desktop";
import { AdminLecturesMobileScreen } from "./admin-lectures.screen.mobile";

export function AdminLecturesScreen() {
  return (
    <Responsive mobile={<AdminLecturesMobileScreen />} desktop={<AdminLecturesDesktopScreen />} />
  );
}
