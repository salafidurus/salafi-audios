"use client";

import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { Responsive } from "@/shared/components/Responsive";
import { ScholarListDesktopScreen } from "./scholar-list.screen.desktop";
import { ScholarListMobileScreen } from "./scholar-list.screen.mobile";

export function ScholarListScreen() {
  const router = useRouter();

  const handleSelectScholar = (slug: string) => {
    router.push(routes.scholars.detail(slug));
  };

  return (
    <Responsive
      mobile={<ScholarListMobileScreen onSelectScholar={handleSelectScholar} />}
      desktop={<ScholarListDesktopScreen onSelectScholar={handleSelectScholar} />}
    />
  );
}
