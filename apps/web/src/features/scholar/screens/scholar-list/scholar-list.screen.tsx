"use client";

import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { Responsive } from "@/shared/components/Responsive";
import { ScholarListDesktopWebScreen } from "./scholar-list.screen.desktop";
import { ScholarListMobileWebScreen } from "./scholar-list.screen.mobile";

export function ScholarListScreen() {
  const router = useRouter();

  const handleSelectScholar = (slug: string) => {
    router.push(routes.scholars.detail(slug));
  };

  return (
    <Responsive
      mobile={<ScholarListMobileWebScreen onSelectScholar={handleSelectScholar} />}
      desktop={<ScholarListDesktopWebScreen onSelectScholar={handleSelectScholar} />}
    />
  );
}
