"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export type LibraryTab = "started" | "saved" | "completed";

type LibraryTabsProps = {
  activeTab: LibraryTab;
};

export function LibraryTabs({ activeTab }: LibraryTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs value={activeTab} orientation="horizontal">
      <TabsList
        className="max-w-full overflow-x-auto"
        aria-label={t("navigation.subnav.library.label", "Library sections")}
      >
        <TabsTrigger value="started" asChild>
          <Link href={routes.library.index}>
            {t("navigation.subnav.library.started", "Started")}
          </Link>
        </TabsTrigger>
        <TabsTrigger value="saved" asChild>
          <Link href={routes.library.saved}>{t("library.saved", "Saved")}</Link>
        </TabsTrigger>
        <TabsTrigger value="completed" asChild>
          <Link href={routes.library.completed}>{t("library.completed", "Completed")}</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
