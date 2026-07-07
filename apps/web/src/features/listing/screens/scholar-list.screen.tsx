"use client";

import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { Responsive } from "@/shared/components/Responsive";
import {
  ScholarListDesktopScreen,
  type ScholarListDesktopScreenProps,
} from "./scholar-list.screen.desktop";
import {
  ScholarListMobileScreen,
  type ScholarListMobileScreenProps,
} from "./scholar-list.screen.mobile";

export type ScholarListScreenProps = ScholarListDesktopScreenProps & ScholarListMobileScreenProps;

export function ScholarListScreen() {
  const { push } = useRouter();

  const handleSelectScholar = (slug: string) => {
    push(routes.scholars.detail(slug));
  };

  const mobile = <ScholarListMobileScreen onSelectScholar={handleSelectScholar} />;
  const desktop = <ScholarListDesktopScreen onSelectScholar={handleSelectScholar} />;
  // react-doctor-disable-next-line react-doctor/jsx-no-jsx-as-prop
  return <Responsive mobile={mobile} desktop={desktop} />;
}
