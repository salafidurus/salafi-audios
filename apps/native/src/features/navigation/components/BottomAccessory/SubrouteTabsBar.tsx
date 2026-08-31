import { Button, Row, ScrollView } from "@expo/ui";
import { getSubnavLabel } from "@sd/core-i18n";
import { type Href, usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { SECTION_TABS, type Section, type TabConfig } from "@/features/navigation/types";
import { getSectionTabIcon } from "@/features/navigation/utils/section-tab-icons";
import {
  buildSectionPath,
  getActiveSubsection,
  getRootTabFromPathname,
} from "@/features/navigation/utils/tab-route-config";
import { NativeText } from "@/shared/ui";

/** Renders route-owned subsection navigation with native controls and labels. */
/** Renders route-owned subsection navigation with native controls and labels. */
export function SubrouteTabsBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const activeRootTab = getRootTabFromPathname(pathname);
  // SAFETY: the accessory is not rendered for search routes.
  const section = activeRootTab as Section;
  const tabs = SECTION_TABS[section];
  const activeSubsection = getActiveSubsection(pathname, section);

  const renderTab = (tab: TabConfig) => {
    const isActive = tab.id === activeSubsection;
    const href = buildSectionPath(section, tab.id);
    const Icon = getSectionTabIcon(section, tab.id);
    // SAFETY: Button forwards these accessibility fields to the platform control.
    const accessibilityProps = {
      accessibilityRole: "button",
      accessibilityState: { selected: isActive },
    } as any;

    return (
      <Button
        key={tab.id}
        // SAFETY: href is built exclusively from the registered section-tab routes.
        onPress={() => router.replace(/* SAFETY: registered tab route */ href as Href)}
        {...accessibilityProps}
        style={/* SAFETY: native button accepts token-backed style */ styles.tabPressable as any}
      >
        <Row
          alignment="center"
          spacing={6}
          style={
            /* SAFETY: native row accepts token-backed style */ [
              styles.tab,
              isActive && styles.tabActive,
            ] as any
          }
        >
          {Icon ? (
            <Icon
              size={14}
              color={isActive ? theme.colors.content.primary : theme.colors.content.muted}
            />
          ) : null}
          <NativeText
            variant="labelMd"
            textStyle={
              /* SAFETY: native text accepts token-backed style */ [
                styles.label,
                isActive && styles.labelActive,
              ] as any
            }
          >
            {getSubnavLabel(section, tab.id, t)}
          </NativeText>
        </Row>
      </Button>
    );
  };

  if (activeRootTab === "search" || !tabs || tabs.length === 0) {
    return null;
  }

  return (
    <ScrollView
      direction="horizontal"
      showsIndicators={false}
      style={/* SAFETY: native scroll accepts token-backed style */ styles.container as any}
    >
      <Row
        spacing={4}
        style={/* SAFETY: native row accepts token-backed style */ styles.scrollContent as any}
      >
        {tabs.map(renderTab)}
      </Row>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.component.chip,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignSelf: "stretch",
    ...theme.shadows.sm,
  },
  scrollContent: {
    alignItems: "center",
    padding: 4,
  },
  tabPressable: {
    flex: 1,
    minWidth: 64,
  },
  tab: {
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.sm,
    paddingVertical: theme.spacing.scale.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.surface.subtle,
  },
  label: {
    color: theme.colors.content.muted,
  },
  labelActive: {
    color: theme.colors.content.primary,
    fontWeight: "600",
  },
}));
