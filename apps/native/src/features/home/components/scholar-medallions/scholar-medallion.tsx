import { Image } from "expo-image";
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
  const displayName = scholar.name
    .replace(/^Shaykh\s+(Allamah\s+)?/i, "")
    .replace(/^al-/i, "")
    .trim();

  const initials =
    scholar.initials ??
    scholar.name
      .replace(/^Shaykh\s+(Allamah\s+)?/i, "")
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <Pressable
      testID={`scholar-medallion-${scholar.slug}`}
      onPress={() => onPress?.(scholar.slug)}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={scholar.name}
    >
      <View style={styles.avatar}>
        {scholar.imageUrl ? (
          <Image
            source={{ uri: scholar.imageUrl }}
            style={styles.image}
            contentFit="cover"
            testID={`scholar-medallion-image-${scholar.slug}`}
          />
        ) : (
          <AppText variant="displayMd" style={styles.initialsText}>
            {initials}
          </AppText>
        )}
      </View>
      <AppText variant="xs" color="strong" style={styles.nameText} numberOfLines={2}>
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
    backgroundColor: theme.colors.action.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  initialsText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nameText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },
}));
