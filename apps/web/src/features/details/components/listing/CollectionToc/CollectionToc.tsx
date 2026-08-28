"use client";

import type { ListingModuleDto } from "@sd/core-contracts";

import { Minimize2, Maximize2 } from "lucide-react";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
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
  onSelect: (moduleId: string) => void;
  activeModuleId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function CollectionToc({
  modules,
  onSelect,
  activeModuleId,
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
            <CollectionTocHeader isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />

            <SidebarContent className={styles.content}>
              <SidebarGroup className={styles.group}>
                <SidebarGroupContent>
                  <CollectionTocMenu
                    modules={modules}
                    activeModuleId={activeModuleId}
                    isCollapsed={isCollapsed}
                    onSelect={onSelect}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </nav>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function CollectionTocHeader({
  isCollapsed = false,
  onToggleCollapse,
}: Pick<CollectionTocProps, "isCollapsed" | "onToggleCollapse">) {
  const { t } = useTranslation();
  return (
    <SidebarHeader className={styles.header}>
      {!isCollapsed && (
        <SidebarGroupLabel className={styles.title}>
          {t("listing.tableOfContents", "Table of Contents")}
        </SidebarGroupLabel>
      )}
      {onToggleCollapse && (
        <SidebarGroupAction
          type="button"
          onClick={onToggleCollapse}
          aria-label={getToggleLabel(isCollapsed, t)}
          title={getToggleLabel(isCollapsed, t)}
          className={styles.toggleButton}
        >
          {isCollapsed ? <Maximize2 /> : <Minimize2 />}
        </SidebarGroupAction>
      )}
    </SidebarHeader>
  );
}

function getToggleLabel(isCollapsed: boolean, t: ReturnType<typeof useTranslation>["t"]): string {
  return isCollapsed
    ? t("listing.expandTableOfContents", "Expand Table of Contents")
    : t("listing.collapseTableOfContents", "Collapse Table of Contents");
}

function CollectionTocMenu({
  modules,
  activeModuleId,
  isCollapsed,
  onSelect,
}: Pick<CollectionTocProps, "modules" | "activeModuleId" | "isCollapsed" | "onSelect">) {
  return (
    <SidebarMenu>
      {modules.map((mod, index) => (
        <SidebarMenuItem key={mod.id}>
          <SidebarMenuButton
            type="button"
            size="sm"
            tooltip={mod.title}
            aria-label={mod.title}
            aria-current={mod.id === activeModuleId ? "true" : undefined}
            isActive={mod.id === activeModuleId}
            onClick={() => onSelect(mod.id)}
            className={styles.moduleButton}
          >
            {isCollapsed ? (
              <span className={styles.moduleMarker} aria-hidden="true">
                {index + 1}
              </span>
            ) : (
              <span>{mod.title}</span>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
