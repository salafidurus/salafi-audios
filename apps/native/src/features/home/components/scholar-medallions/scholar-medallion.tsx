import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components";

export type ScholarMedallionItem = {
  id: string;
  slug: string;
  name: string;
  initials?: string;
  lectureCount?: number;
  imageUrl?: string;
};

export type ScholarMedallionProps = {
  scholar: ScholarMedallionItem;
  onPress?: (slug: string) => void;
};

export function ScholarMedallion({ scholar, onPress }: ScholarMedallionProps) {
  const initials =
    scholar.initials ??
    scholar.name
      .replace(/^Shaykh\s+(Allamah\s+)?/i, "")
      .trim()
      .charAt(0)
      .toUpperCase();

  const displayName = scholar.name
    .replace(/^Shaykh\s+(Allamah\s+)?/i, "")
    .replace(/^al-/i, "")
    .trim();

  return (
    <Pressable
      testID={`scholar-medallion-${scholar.slug}`}
      onPress={() => onPress?.(scholar.slug)}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={scholar.name}
    >
      <View style={styles.avatar}>
        <AppText variant="displayMd" style={styles.initialsText}>
          {initials}
        </AppText>
      </View>
      <AppText variant="xs" style={styles.nameText} numberOfLines={2}>
        {displayName}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    width: 76,
    marginRight: 14,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#8CAF9B",
    borderWidth: 1,
    borderColor: "#749985",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nameText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.content.strong,
    textAlign: "center",
    lineHeight: 14,
  },
}));
