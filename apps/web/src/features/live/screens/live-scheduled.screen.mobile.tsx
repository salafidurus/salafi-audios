"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLiveScheduledScreen } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveScheduledMobileScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveScheduledMobileScreen({
  onNavigateToSession,
}: LiveScheduledMobileScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();
  const { t } = useTranslation();

  const renderContent = () => {
    if (isFetching && sessions.length === 0) {
      return (
        <div style={{ padding: 16, textAlign: "center", color: "var(--content-muted)" }}>
          {t("common.loading", "Loading…")}
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <AppText
          variant="bodyMd"
          style={{
            color: "var(--content-subtle)",
            padding: 16,
            textAlign: "center",
            display: "block",
          }}
        >
          {t("live.sections.scheduled.empty", "No upcoming sessions scheduled.")}
        </AppText>
      );
    }

    return (
      <div className={styles.list}>
        {sessions.map((session) => (
          <LiveSessionRow
            key={session.id}
            session={session}
            onPress={() => onNavigateToSession?.(session.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <ScreenView>
      <div className={styles.page}>
        <div className={styles.listContainer}>
          <AppText variant="titleLg" style={{ display: "block", marginBottom: 16 }}>
            {t("live.sections.scheduled.header", "Scheduled Sessions")}
          </AppText>
          {renderContent()}
        </div>
      </div>
    </ScreenView>
  );
}
