"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useLiveSessions } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import { LiveSkeleton } from "../components/live-skeleton/live-skeleton";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveDesktopScreenProps = Record<string, never>;

export function LiveDesktopScreen() {
  const { active } = useLiveSessions();
  const { t } = useTranslation();

  let content;
  if (active.isLoading && active.sessions.length === 0) {
    content = <LiveSkeleton />;
  } else if (active.sessions.length === 0) {
    content = (
      <EmptyState
        message={t("live.sections.ongoing.empty", "No live sessions right now — check back soon.")}
      />
    );
  } else {
    content = (
      <div className={styles.list}>
        {active.sessions.map((s) => (
          <LiveSessionRow key={s.id} session={s} />
        ))}
      </div>
    );
  }

  return (
    <ScreenView>
      <PageHeader title={t("live.title", "Live Sessions")} />
      {content}
    </ScreenView>
  );
}
