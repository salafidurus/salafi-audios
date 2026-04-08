import { View, Pressable, Linking } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText } from "@sd/shared";
import type { LiveSessionPublicDto } from "@sd/core-contracts";

export type LiveSessionCardNativeProps = {
  session: LiveSessionPublicDto;
};

export function LiveSessionCardNative({ session }: LiveSessionCardNativeProps) {
  const { theme } = useUnistyles();

  const handlePress = () => {
    if (session.telegramSlug) {
      Linking.openURL(`https://t.me/${session.telegramSlug}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        cardStyles.card,
        { backgroundColor: theme.colors.surface.default, borderColor: theme.colors.border.default },
        session.status === "ended" && cardStyles.cardEnded,
        pressed && cardStyles.pressed,
      ]}
    >
      <View style={cardStyles.headerRow}>
        {session.status === "live" && (
          <View style={cardStyles.liveBadge}>
            <View style={cardStyles.pulseDot} />
            <AppText variant="caption" style={cardStyles.liveText}>
              LIVE
            </AppText>
          </View>
        )}
        <AppText variant="bodyMd" style={cardStyles.title}>
          {session.title ?? session.channelDisplayName}
        </AppText>
      </View>

      <AppText variant="caption" style={{ color: theme.colors.content.subtle }}>
        {session.scholarName ? `${session.scholarName} · ` : ""}
        {session.channelDisplayName}
      </AppText>

      {session.status === "scheduled" && session.scheduledAt && (
        <AppText variant="caption" style={cardStyles.scheduledTime}>
          Scheduled: {new Date(session.scheduledAt).toLocaleString()}
        </AppText>
      )}

      {session.status === "ended" && session.endedAt && (
        <AppText variant="caption" style={{ color: theme.colors.content.muted }}>
          Ended: {new Date(session.endedAt).toLocaleString()}
        </AppText>
      )}
    </Pressable>
  );
}

const cardStyles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.component.gapSm,
    padding: theme.spacing.component.cardPadding,
    borderRadius: theme.radius.component.card,
    borderWidth: 1,
    marginBottom: theme.spacing.component.gapSm,
  },
  cardEnded: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
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
    fontWeight: "600",
    flex: 1,
  },
  scheduledTime: {
    color: "#2563eb",
  },
}));
