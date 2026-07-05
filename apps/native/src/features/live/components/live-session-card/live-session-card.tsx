import { View, Pressable, Linking } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText } from "@/shared/components/AppText/AppText";
import type { LiveSessionPublicDto } from "@sd/core-contracts";

export type LiveSessionCardProps = {
  session: LiveSessionPublicDto;
};

export function LiveSessionCard({ session }: LiveSessionCardProps) {
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
        {session.status === "scheduled" && (
          <View style={cardStyles.scheduledBadge}>
            <AppText variant="caption" style={cardStyles.scheduledBadgeText}>
              SCHEDULED
            </AppText>
          </View>
        )}
        {session.status === "ended" && (
          <View style={cardStyles.endedBadge}>
            <AppText variant="caption" style={cardStyles.endedBadgeText}>
              ENDED
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
    gap: theme.spacing.scale.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.state.danger,
  },
  liveText: {
    color: theme.colors.state.danger,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scheduledBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.scale.sm,
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  scheduledBadgeText: {
    color: theme.colors.content.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  endedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.scale.sm,
    backgroundColor: theme.colors.surface.subtle,
  },
  endedBadgeText: {
    color: theme.colors.content.muted,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: "600",
    flex: 1,
  },
  scheduledTime: {
    color: theme.colors.content.primary,
  },
}));
