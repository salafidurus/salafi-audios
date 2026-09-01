import type { ScholarDetailDto } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { Linking, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { AppText } from "@/shared/ui";

/** Describes the inputs and callbacks accepted by Scholar Header. */
/** Describes the inputs, callbacks, and optional state accepted by Scholar Header. */
export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    /** Renders the native total duration seconds surface and coordinates its user-facing state. */
    totalDurationSeconds: number;
  };
};

function openLink(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

function renderStats(scholar: ScholarHeaderProps["scholar"], totalHours: number) {
  const stats = [
    { value: scholar.lectureCount, label: "Lectures" },
    { value: scholar.seriesCount, label: "Series" },
    ...(totalHours > 0 ? [{ value: `${totalHours}h`, label: "Total" }] : []),
  ];

  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <View style={styles.statItem} key={stat.label}>
          <AppText variant="titleMd">{stat.value}</AppText>
          <AppText variant="caption" style={styles.statLabel}>
            {stat.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function renderSocialLinks(scholar: ScholarHeaderProps["scholar"]) {
  const links = [
    ["Website", scholar.socialWebsite],
    ["YouTube", scholar.socialYoutube],
    ["Twitter", scholar.socialTwitter],
    ["Telegram", scholar.socialTelegram],
  ].filter((link): link is [string, string] => Boolean(link[1]));

  if (links.length === 0) return null;
  return (
    <View style={styles.socialRow}>
      {links.map(([label, url]) => (
        <Pressable key={label} onPress={() => openLink(url)}>
          <AppText variant="labelMd">{label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

/** Renders the native scholar header surface and coordinates its user-facing state. */
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

      {renderStats(scholar, totalHours)}
      {renderSocialLinks(scholar)}
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
