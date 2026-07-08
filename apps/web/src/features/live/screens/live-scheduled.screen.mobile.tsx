"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useLiveScheduledScreen } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveScheduledMobileScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveScheduledMobileScreen({ onNavigateToSession }: LiveScheduledMobileScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();
  const { t } = useTranslation();

  let content;
  if (isFetching && sessions.length === 0) {
    content = <EmptyState variant="loading" message={t("common.loading", "Loading…")} />;
  } else if (sessions.length === 0) {
    content = (
      <EmptyState message={t("live.sections.scheduled.empty", "No upcoming sessions scheduled.")} />
    );
  } else {
    content = (
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
  }

  return (
    <ScreenView>
      <PageHeader title={t("live.sections.scheduled.header", "Upcoming Sessions")} />
      {content}
    </ScreenView>
  );
}
