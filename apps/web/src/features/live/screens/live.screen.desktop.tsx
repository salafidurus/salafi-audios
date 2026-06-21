"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import type { LiveSessionPublicDto } from "@sd/core-contracts";
import { useLiveSessions } from "@sd/domain-live";
import { LiveSessionCard } from "../components/live-session-card/live-session-card";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveDesktopScreenProps = Record<string, never>;

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

export function LiveDesktopScreen() {
  const { active, upcoming, ended } = useLiveSessions();
  const { t } = useTranslation();

  return (
    <ScreenView>
      <div className={styles.page}>
        <div className={styles.container}>
          <AppText variant="displayMd">{t("live.title", "Live Sessions")}</AppText>

          <div className={styles.twoColumn}>
            <div className={styles.columnMain}>
              <Section
                title={`🔴 ${t("live.sections.ongoing.title", "Live Now")}`}
                sessions={active.sessions}
                isLoading={active.isLoading}
                emptyMessage={t("live.sections.ongoing.empty", "No live sessions right now.")}
              />
            </div>

            <div className={styles.columnSide}>
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
            </div>
          </div>
        </div>
      </div>
    </ScreenView>
  );
}
