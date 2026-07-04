"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLiveSessions } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import { LiveSkeleton } from "../components/live-skeleton/live-skeleton";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./live.screen.module.css";

export type LiveDesktopScreenProps = Record<string, never>;

export function LiveDesktopScreen() {
  const { active } = useLiveSessions();
  const { t } = useTranslation();

  const renderContent = () => {
    if (active.isLoading && active.sessions.length === 0) {
      return <LiveSkeleton />;
    }

    if (active.sessions.length === 0) {
      return (
        <AppText
          variant="bodyMd"
          style={{
            color: "var(--content-subtle)",
            padding: 24,
            textAlign: "center",
            display: "block",
          }}
        >
          {t("live.sections.ongoing.empty", "No live sessions right now — check back soon.")}
        </AppText>
      );
    }

    return (
      <div className={styles.list}>
        {active.sessions.map((s) => (
          <LiveSessionRow key={s.id} session={s} />
        ))}
      </div>
    );
  };

  return (
    <ScreenView>
      <div className={styles.page}>
        <div className={styles.listContainer}>
          <AppText variant="displayMd" style={{ display: "block", marginBottom: 24 }}>
            {t("live.title", "Live Sessions")}
          </AppText>
          {renderContent()}
        </div>
      </div>
    </ScreenView>
  );
}

