"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarDetailDesktopScreen } from "./admin-scholar-detail.screen.desktop";
import { AdminScholarDetailMobileScreen } from "./admin-scholar-detail.screen.mobile";

interface AdminScholarDetailScreenProps {
  id: string;
}

export function AdminScholarDetailScreen({ id }: AdminScholarDetailScreenProps) {
  return (
    <Responsive
      mobile={<AdminScholarDetailMobileScreen id={id} />}
      desktop={<AdminScholarDetailDesktopScreen id={id} />}
    />
  );
}
