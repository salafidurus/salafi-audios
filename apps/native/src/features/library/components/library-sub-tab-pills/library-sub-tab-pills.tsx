import { Bookmark, CheckCircle, Play } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";

export type LibrarySub = "started" | "saved" | "completed";

export const LIBRARY_SUBS: {
  id: LibrarySub;
  labelKey: string;
  fallback: string;
  Icon: React.FC<{ size: number; color: string }>;
}[] = [
  {
    id: "started",
    labelKey: "library.inProgress",
    fallback: "In Progress",
    Icon: Play,
  },
  {
    id: "saved",
    labelKey: "library.saved",
    fallback: "Saved",
    Icon: Bookmark,
  },
  {
    id: "completed",
    labelKey: "library.completed",
    fallback: "Completed",
    Icon: CheckCircle,
  },
];

export type LibrarySubTabPillsProps = {
  active: LibrarySub;
  onChange: (sub: LibrarySub) => void;
};

export function LibrarySubTabPills({ active, onChange }: LibrarySubTabPillsProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.outerWrapper} testID="library-sub-tab-pills">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {LIBRARY_SUBS.map(({ id, labelKey, fallback, Icon }) => {
          const isActive = active === id;
          return (
            <Pressable
              key={id}
              testID={`library-pill-${id}`}
              onPress={() => onChange(id)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                size={13}
                color={isActive ? theme.colors.content.onPrimary : theme.colors.content.muted}
              />
              <AppText
                variant="caption"
                style={[
                  styles.pillText,
                  {
                    color: isActive ? theme.colors.content.onPrimary : theme.colors.content.subtle,
                  },
                ]}
              >
                {t(labelKey, fallback)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerWrapper: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingBottom: 10,
  },
  track: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.full,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.scale.full,
  },
  pillActive: {
    backgroundColor: theme.colors.action.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.action.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  pillInactive: {
    backgroundColor: "transparent",
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
}));
