import { View, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import type { LiveSessionPublicDto } from "@sd/core-contracts";
import { useLiveSessions } from "@sd/domain-live";
import { LiveSessionCard } from "../components/live-session-card/live-session-card";
import { useTranslation } from "@/core/i18n/use-translation";

export type LiveScreenProps = Record<string, never>;

function Section({
  title,
  sessions,
  isLoading,
  emptyMessage,
}: {
  title: string;
  sessions: LiveSessionPublicDto[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <View style={nativeStyles.section}>
      <AppText variant="titleMd">{title}</AppText>
      {isLoading && sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: theme.colors.content.subtle }}>
          {t("common.loading", "Loading...")}
        </AppText>
      ) : sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: theme.colors.content.subtle }}>
          {emptyMessage}
        </AppText>
      ) : (
        <View>
          {sessions.map((s) => (
            <LiveSessionCard key={s.id} session={s} />
          ))}
        </View>
      )}
    </View>
  );
}

export function LiveScreen(_props: LiveScreenProps) {
  const { active, upcoming, ended } = useLiveSessions();
  const { t } = useTranslation();

  return (
    <ScreenView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={nativeStyles.scroll}>
        <AppText variant="titleLg">{t("live.title", "Live Sessions")}</AppText>

        <Section
          title={`🔴 ${t("live.sections.ongoing.title", "Live Now")}`}
          sessions={active.sessions}
          isLoading={active.isLoading}
          emptyMessage={t("live.sections.ongoing.empty", "No live sessions right now.")}
        />
        <Section
          title={t("live.sections.scheduled.title", "Upcoming")}
          sessions={upcoming.sessions}
          isLoading={upcoming.isLoading}
          emptyMessage={t("live.sections.scheduled.empty", "No upcoming sessions scheduled.")}
        />
        <Section
          title={t("live.sections.ended.title", "Recently Ended")}
          sessions={ended.sessions}
          isLoading={ended.isLoading}
          emptyMessage={t("live.sections.ended.empty", "No recent sessions.")}
        />
      </ScrollView>
    </ScreenView>
  );
}

const nativeStyles = StyleSheet.create((theme) => ({
  scroll: {
    paddingBottom: theme.spacing.layout.sectionY,
    gap: theme.spacing.layout.sectionY,
  },
  section: {
    gap: theme.spacing.component.gapMd,
  },
}));
