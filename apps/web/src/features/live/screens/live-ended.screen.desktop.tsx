"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLiveEndedScreen } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import styles from "./live.screen.module.css";

export type LiveEndedDesktopScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedDesktopScreen({
  onNavigateToSession,
}: LiveEndedDesktopScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  const renderContent = () => {
    if (isFetching && sessions.length === 0) {
      return <div style={{ padding: 32, textAlign: "center" }}>Loading past sessions…</div>;
    }

    if (sessions.length === 0) {
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
          No past sessions available.
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
          <AppText variant="displayMd" style={{ display: "block", marginBottom: 24 }}>
            Past Sessions
          </AppText>
          {renderContent()}
        </div>
      </div>
    </ScreenView>
  );
}

