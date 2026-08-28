import { getSubnavLabel } from "@sd/core-i18n";
import { usePathname, useRouter, type Href } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { SECTION_TABS, type TabConfig } from "@/features/navigation/types";
import { getSectionTabIcon } from "@/features/navigation/utils/section-tab-icons";
import {
  buildSectionPath,
  getActiveSubsection,
  getRootTabFromPathname,
  isSection,
} from "@/features/navigation/utils/tab-route-config";

/** Describes the SubrouteTabsBar native contract and behavior. */
/** Describes the SubrouteTabsBar native function contract and behavior. */
export function SubrouteTabsBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const activeRootTab = getRootTabFromPathname(pathname);
  if (!isSection(activeRootTab)) {
    return null;
  }

  const tabs = SECTION_TABS[activeRootTab];
  const activeSubsection = getActiveSubsection(pathname, activeRootTab);

  const renderTab = (tab: TabConfig) => {
    const isActive = tab.id === activeSubsection;
    const href = buildSectionPath(activeRootTab, tab.id);
    const Icon = getSectionTabIcon(activeRootTab, tab.id);

    return (
      <Pressable
        key={tab.id}
        // SAFETY: `href` is built from the statically registered section tabs.
        onPress={() => router.replace(href as Href)}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        style={styles.tabPressable}
      >
        <EaseView
          animate={{ scale: isActive ? 1 : 0.98, opacity: isActive ? 1 : 0.82 }}
          transition={{ type: "spring", damping: 12, stiffness: 150 }}
        >
          <View style={[styles.tab, isActive && styles.tabActive]}>
            {Icon ? (
              <Icon
                size={14}
                strokeWidth={1.8}
                color={isActive ? styles.labelActive.color : styles.label.color}
              />
            ) : null}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.label, isActive && styles.labelActive]}
            >
              {getSubnavLabel(activeRootTab, tab.id, t)}
            </Text>
          </View>
        </EaseView>
      </Pressable>
    );
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {tabs.map(renderTab)}
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
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    padding: 4,
    gap: 4,
  },
  tabPressable: {
    flex: 1,
    minWidth: 64,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scale.xs,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.sm,
    paddingVertical: theme.spacing.scale.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.surface.subtle,
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  labelActive: {
    color: theme.colors.content.primary,
    fontWeight: "600",
  },
}));
