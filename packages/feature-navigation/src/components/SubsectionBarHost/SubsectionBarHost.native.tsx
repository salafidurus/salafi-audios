import { type Href, usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";
import { SECTION_TABS, type Section } from "../../types";
import {
  buildSectionPath,
  getActiveSubsection,
  getRootTabFromPathname,
} from "../../utils/tab-route-config.native";
import { getSectionTabIcon } from "../../utils/section-tab-icons.native";
import { SUBSECTION_BAR_HEIGHT, TAB_BAR_HEIGHT } from "../CustomTabBar/CustomTabBar.native";

export function SubsectionBarHostMobileNative() {
  const pathname = usePathname();
  const router = useRouter();
  const activeRootTab = getRootTabFromPathname(pathname);

  if (activeRootTab === "search") {
    return null;
  }

  const section = activeRootTab as Section;
  const tabs = SECTION_TABS[section];
  const activeSubsection = getActiveSubsection(pathname, section);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.bar}>
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
              style={styles.itemPressable}
            >
              <EaseView
                animate={{ scale: isActive ? 1 : 0.98, opacity: isActive ? 1 : 0.82 }}
                transition={{ type: "spring", damping: 12, stiffness: 150 }}
              >
                <View style={[styles.item, isActive && styles.itemActive]}>
                  {Icon ? (
                    <Icon
                      size={14}
                      strokeWidth={1.8}
                      color={isActive ? styles.labelActive.color : styles.label.color}
                    />
                  ) : null}
                  <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
                </View>
              </EaseView>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function getSceneBottomInsetForPath(pathname: string): number {
  const activeRootTab = getRootTabFromPathname(pathname);
  return activeRootTab === "search"
    ? TAB_BAR_HEIGHT + 24
    : TAB_BAR_HEIGHT + SUBSECTION_BAR_HEIGHT + 32;
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT + theme.spacing.scale.lg,
    paddingHorizontal: theme.spacing.layout.pageX,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
    minHeight: SUBSECTION_BAR_HEIGHT,
    paddingHorizontal: theme.spacing.scale.xs,
    paddingVertical: theme.spacing.scale.xs,
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.colors.surface.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
  },
  itemPressable: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scale.xs,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.sm,
    paddingVertical: theme.spacing.scale.sm,
  },
  itemActive: {
    backgroundColor: theme.colors.surface.subtle,
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  labelActive: {
    color: theme.colors.content.primary,
  },
}));
