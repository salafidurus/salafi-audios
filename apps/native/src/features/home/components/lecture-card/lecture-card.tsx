import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { AppText } from "@/shared/components";

export type ParchmentLectureCardItem = {
  id: string;
  slug: string;
  title: string;
  scholarName: string;
  category?: string;
  lessonsCount?: number;
  completedLessonsCount?: number;
  dateFormatted?: string;
};

export type ParchmentLectureCardProps = {
  item: ParchmentLectureCardItem;
  onPress?: (slug: string) => void;
};

function formatDateString(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (!raw.includes("T") && !raw.includes("-")) return raw;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return raw;
  }
}

export function ParchmentLectureCard({ item, onPress }: ParchmentLectureCardProps) {
  const { theme } = useUnistyles();

  const initials = item.title.trim().charAt(0).toUpperCase();
  const displayDate = formatDateString(item.dateFormatted);

  return (
    <Pressable
      testID={`lecture-card-${item.slug}`}
      onPress={() => onPress?.(item.slug)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.iconBox}>
        <AppText variant="displayMd" style={styles.initialText}>
          {initials}
        </AppText>
      </View>

      <View style={styles.textContainer}>
        <AppText variant="titleMd" color="strong" style={styles.titleText} numberOfLines={2}>
          {item.title}
        </AppText>
        <AppText variant="caption" color="subtle" style={styles.scholarText} numberOfLines={1}>
          {item.scholarName}
        </AppText>
        {displayDate ? (
          <AppText variant="xs" color="muted" style={styles.dateText}>
            {displayDate}
          </AppText>
        ) : null}
      </View>

      <View style={styles.chevronWrapper}>
        <ChevronRight size={18} color={theme.colors.content.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: theme.colors.action.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  initialText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 2,
  },
  scholarText: {
    fontSize: 13,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
  },
  chevronWrapper: {
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
}));
