import type { ScholarDetailDto } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { Linking, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

function openLink(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

export function ScholarHeader({ scholar }: ScholarHeaderProps) {
  const formatScholarName = useFormatScholarName();
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <UserAvatar image={scholar.imageUrl} name={scholar.name} size={96} />
      </View>
      <AppText variant="titleLg" style={styles.name}>
        {formatScholarName(scholar)}
      </AppText>
      {scholar.country || scholar.mainLanguage ? (
        <AppText variant="caption" style={styles.meta}>
          {[scholar.country, scholar.mainLanguage].filter(Boolean).join(" · ")}
        </AppText>
      ) : null}
      {scholar.bio ? (
        <AppText variant="bodyMd" style={styles.bio}>
          {scholar.bio}
        </AppText>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <AppText variant="titleMd">{scholar.lectureCount}</AppText>
          <AppText variant="caption" style={styles.statLabel}>
            Lectures
          </AppText>
        </View>
        <View style={styles.statItem}>
          <AppText variant="titleMd">{scholar.seriesCount}</AppText>
          <AppText variant="caption" style={styles.statLabel}>
            Series
          </AppText>
        </View>
        {totalHours > 0 ? (
          <View style={styles.statItem}>
            <AppText variant="titleMd">{totalHours}h</AppText>
            <AppText variant="caption" style={styles.statLabel}>
              Total
            </AppText>
          </View>
        ) : null}
      </View>

      {scholar.socialWebsite ||
      scholar.socialYoutube ||
      scholar.socialTwitter ||
      scholar.socialTelegram ? (
        <View style={styles.socialRow}>
          {scholar.socialWebsite ? (
            <Pressable onPress={() => openLink(scholar.socialWebsite!)}>
              <AppText variant="labelMd">Website</AppText>
            </Pressable>
          ) : null}
          {scholar.socialYoutube ? (
            <Pressable onPress={() => openLink(scholar.socialYoutube!)}>
              <AppText variant="labelMd">YouTube</AppText>
            </Pressable>
          ) : null}
          {scholar.socialTwitter ? (
            <Pressable onPress={() => openLink(scholar.socialTwitter!)}>
              <AppText variant="labelMd">Twitter</AppText>
            </Pressable>
          ) : null}
          {scholar.socialTelegram ? (
            <Pressable onPress={() => openLink(scholar.socialTelegram!)}>
              <AppText variant="labelMd">Telegram</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    marginBottom: theme.spacing.scale.md,
  },
  avatarWrapper: {
    marginBottom: theme.spacing.scale.md,
  },
  name: {
    textAlign: "center",
  },
  meta: {
    marginTop: theme.spacing.scale.xs,
    textAlign: "center",
    opacity: 0.7,
  },
  bio: {
    marginTop: theme.spacing.scale.md,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.scale["2xl"],
    marginTop: theme.spacing.scale.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    opacity: 0.6,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.scale.md,
    marginTop: theme.spacing.scale.lg,
  },
}));
