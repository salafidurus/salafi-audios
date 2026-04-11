"use client";

import { View, Pressable, Linking } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { AppText } from "@/shared/components/AppText/AppText";
import { useActiveSession } from "@sd/domain-live";

export type CurrentlyLiveIndicatorProps = {
  /** Show compact version (just the dot and "LIVE") */
  compact?: boolean;
};

export function CurrentlyLiveIndicator({ compact = false }: CurrentlyLiveIndicatorProps) {
  const { activeSession, isLoading } = useActiveSession();

  if (isLoading || !activeSession) {
    return null;
  }

  const handlePress = () => {
    if (activeSession.telegramSlug) {
      Linking.openURL(`https://t.me/${activeSession.telegramSlug}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        compact ? indicatorStyles.containerCompact : indicatorStyles.container,
        pressed && indicatorStyles.pressed,
      ]}
    >
      <View style={indicatorStyles.liveBadge}>
        <View style={indicatorStyles.pulseDot} />
        <AppText variant="caption" style={indicatorStyles.liveText}>
          LIVE
        </AppText>
      </View>
      {!compact && (
        <AppText variant="bodyMd" numberOfLines={1} style={indicatorStyles.title}>
          {activeSession.title ?? activeSession.channelDisplayName}
        </AppText>
      )}
    </Pressable>
  );
}

const indicatorStyles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
    padding: theme.spacing.component.gapSm,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.component.chip,
  },
  containerCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  liveText: {
    color: "#dc2626",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: "500",
    flex: 1,
  },
}));
