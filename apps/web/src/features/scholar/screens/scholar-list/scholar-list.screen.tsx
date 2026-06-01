"use client";

import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { Responsive } from "@/shared/components/Responsive";
import { ScholarListDesktopScreen } from "./scholar-list.screen.desktop";
import { ScholarListMobileScreen } from "./scholar-list.screen.mobile";

export function ScholarListScreen() {
  const { push } = useRouter();

  const handleSelectScholar = (slug: string) => {
    push(routes.scholars.detail(slug));
  };

  const mobile = <ScholarListMobileScreen onSelectScholar={handleSelectScholar} />;
  const desktop = <ScholarListDesktopScreen onSelectScholar={handleSelectScholar} />;
  return <Responsive mobile={mobile} desktop={desktop} />;
}
