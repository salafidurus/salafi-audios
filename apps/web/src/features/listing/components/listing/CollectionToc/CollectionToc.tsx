"use client";

import type { ListingModuleDto } from "@sd/core-contracts";

import { BookOpen, Minimize2, Maximize2 } from "lucide-react";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Badge } from "@/shared/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/utils";

import styles from "./CollectionToc.module.css";

export type CollectionTocProps = {
  modules: ListingModuleDto[];
  lessonCount: number;
  onSelect: (moduleId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function CollectionToc({
  modules,
  lessonCount,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
}: CollectionTocProps) {
  const { t } = useTranslation();

  if (modules.length === 0) return null;

  return (
    <TooltipProvider>
      <SidebarProvider
        open={!isCollapsed}
        onOpenChange={(open) => {
          if (open === isCollapsed) onToggleCollapse?.();
        }}
        className={styles.provider}
      >
        <nav aria-label={t("listing.tableOfContents", "Table of Contents")} className={styles.nav}>
          <Sidebar
            collapsible="none"
            side="right"
            className={cn(styles.container, isCollapsed && styles.collapsed)}
          >
            <SidebarHeader className={styles.header}>
              <div className={styles.headerRow}>
                {!isCollapsed && (
                  <SidebarGroupLabel className={styles.title}>
                    {t("listing.tableOfContents", "Table of Contents")}
                  </SidebarGroupLabel>
                )}
                {!isCollapsed && (
                  <Badge variant="secondary" className={styles.metadata}>
                    {modules.length} {t("listing.modules", "modules")} · {lessonCount}{" "}
                    {t("listing.items", "lessons")}
                  </Badge>
                )}
              </div>
              {onToggleCollapse && (
                <SidebarGroupAction
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label={
                    isCollapsed
                      ? t("listing.expandTableOfContents", "Expand Table of Contents")
                      : t("listing.collapseTableOfContents", "Collapse Table of Contents")
                  }
                  title={
                    isCollapsed
                      ? t("listing.expandTableOfContents", "Expand Table of Contents")
                      : t("listing.collapseTableOfContents", "Collapse Table of Contents")
                  }
                  className={styles.toggleButton}
                >
                  {isCollapsed ? <Maximize2 /> : <Minimize2 />}
                </SidebarGroupAction>
              )}
            </SidebarHeader>

            <SidebarContent className={styles.content}>
              <SidebarGroup className={styles.group}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {modules.map((mod) => (
                      <SidebarMenuItem key={mod.id}>
                        <SidebarMenuButton
                          type="button"
                          size="sm"
                          tooltip={mod.title}
                          aria-label={mod.title}
                          onClick={() => onSelect(mod.id)}
                          className={styles.moduleButton}
                        >
                          <BookOpen aria-hidden="true" />
                          {!isCollapsed && <span>{mod.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </nav>
      </SidebarProvider>
    </TooltipProvider>
  );
}
