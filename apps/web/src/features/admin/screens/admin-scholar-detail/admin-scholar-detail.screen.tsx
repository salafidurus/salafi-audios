"use client";

import { useMemo } from "react";
import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarDetailDesktopScreen } from "./admin-scholar-detail.screen.desktop";
import { AdminScholarDetailMobileScreen } from "./admin-scholar-detail.screen.mobile";

interface AdminScholarDetailScreenProps {
  id: string;
}

export function AdminScholarDetailScreen({ id }: AdminScholarDetailScreenProps) {
  const mobile = useMemo(() => <AdminScholarDetailMobileScreen id={id} />, [id]);
  const desktop = useMemo(() => <AdminScholarDetailDesktopScreen id={id} />, [id]);
  return <Responsive mobile={mobile} desktop={desktop} />;
}
