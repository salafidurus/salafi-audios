import { getSubnavLabel } from "@sd/core-i18n";
import { type Href, usePathname, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";

import { SECTION_TABS, type Section } from "@/features/navigation/types";
import { getSectionTabIcon } from "@/features/navigation/utils/section-tab-icons";
import {
  buildSectionPath,
  getActiveSubsection,
  getRootTabFromPathname,
} from "@/features/navigation/utils/tab-route-config";

export function HeaderSubrouteTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const activeRootTab = getRootTabFromPathname(pathname);
  if (activeRootTab === "search") {
    return null;
  }

  const section = activeRootTab as Section;
  const tabs = SECTION_TABS[section];
  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeSubsection = getActiveSubsection(pathname, section);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeSubsection;
        const href = buildSectionPath(section, tab.id);
        const Icon = getSectionTabIcon(section, tab.id);

        return (
          <Pressable
            key={tab.id}
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
                  {getSubnavLabel(section, tab.id, t)}
                </Text>
              </View>
            </EaseView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.component.chip || 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginHorizontal: theme.spacing.layout.pageX,
    marginVertical: theme.spacing.scale.xs,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    minWidth: 80,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scale.xs || 4,
    borderRadius: theme.radius.component.chip || 18,
    paddingHorizontal: theme.spacing.scale.md || 16,
    paddingVertical: theme.spacing.scale.xs || 6,
  },
  tabActive: {
    backgroundColor: theme.colors.surface.subtle || "#eaeaea",
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
