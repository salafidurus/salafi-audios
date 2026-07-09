"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useLiveScheduledScreen } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import styles from "./live.screen.module.css";

export type LiveScheduledScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveScheduledScreen({ onNavigateToSession }: LiveScheduledScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <ScreenView>
      <PageHeader
        title={
          isDesktop
            ? t("live.sections.scheduled.header", "Scheduled Sessions")
            : t("live.sections.scheduled.header", "Upcoming Sessions")
        }
      />
      {isFetching && sessions.length === 0 ? (
        <EmptyState variant="loading" message={t("common.loading", "Loading\u2026")} />
      ) : sessions.length === 0 ? (
        <EmptyState
          message={t("live.sections.scheduled.empty", "No upcoming sessions scheduled.")}
        />
      ) : (
        <div className={styles.list}>
          {sessions.map((session) => (
            <LiveSessionRow
              key={session.id}
              session={session}
              onPress={() => onNavigateToSession?.(session.id)}
            />
          ))}
        </div>
      )}
    </ScreenView>
  );
}
