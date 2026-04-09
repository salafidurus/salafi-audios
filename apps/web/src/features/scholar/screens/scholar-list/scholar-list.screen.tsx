"use client";

import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import styles from "../responsive.module.css";
import { ScholarListDesktopWebScreen } from "./scholar-list.screen.desktop";
import { ScholarListMobileWebScreen } from "./scholar-list.screen.mobile";

export function ScholarListResponsiveScreen() {
  const router = useRouter();

  const handleSelectScholar = (slug: string) => {
    router.push(routes.scholars.detail(slug));
  };

  return (
    <>
      <div className={styles.mobileOnly}>
        <ScholarListMobileWebScreen onSelectScholar={handleSelectScholar} />
      </div>
      <div className={styles.desktopOnly}>
        <ScholarListDesktopWebScreen onSelectScholar={handleSelectScholar} />
      </div>
    </>
  );
}
