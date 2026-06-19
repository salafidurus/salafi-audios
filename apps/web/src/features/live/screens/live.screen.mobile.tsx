"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import type { LiveSessionPublicDto } from "@sd/core-contracts";
import { useLiveSessions } from "@sd/domain-live";
import { LiveSessionCard } from "../components/live-session-card/live-session-card";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveMobileScreenProps = Record<string, never>;

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
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <AppText variant="titleMd">{title}</AppText>
      {isLoading && sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: "var(--content-subtle, #666)" }}>
          {t("common.loading", "Loading...")}
        </AppText>
      ) : sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: "var(--content-subtle, #666)" }}>
          {emptyMessage}
        </AppText>
      ) : (
        <div className={styles.cardList}>
          {sessions.map((s) => (
            <LiveSessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LiveMobileScreen() {
  const { active, upcoming, ended } = useLiveSessions();
  const { t } = useTranslation();

  return (
    <ScreenView>
      <div className={styles.page}>
        <div className={styles.container}>
          <AppText variant="titleLg">{t("live.title", "Live Sessions")}</AppText>

          <Section
            title={`🔴 ${t("live.liveNow", "Live Now")}`}
            sessions={active.sessions}
            isLoading={active.isLoading}
            emptyMessage={t("live.emptyLive", "No live sessions right now.")}
          />
          <Section
            title={t("live.upcoming", "Upcoming")}
            sessions={upcoming.sessions}
            isLoading={upcoming.isLoading}
            emptyMessage={t("live.emptyUpcoming", "No upcoming sessions scheduled.")}
          />
          <Section
            title={t("live.recentlyEnded", "Recently Ended")}
            sessions={ended.sessions}
            isLoading={ended.isLoading}
            emptyMessage={t("live.emptyEnded", "No recent sessions.")}
          />
        </div>
      </div>
    </ScreenView>
  );
}
