"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useLiveEndedScreen } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveEndedDesktopScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedDesktopScreen({ onNavigateToSession }: LiveEndedDesktopScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();
  const { t } = useTranslation();

  let content;
  if (isFetching && sessions.length === 0) {
    content = <EmptyState variant="loading" message={t("common.loading", "Loading…")} />;
  } else if (sessions.length === 0) {
    content = <EmptyState message={t("live.sections.ended.empty", "No recent sessions.")} />;
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
      <PageHeader title={t("live.sections.ended.header", "Past Sessions")} />
      {content}
    </ScreenView>
  );
}
