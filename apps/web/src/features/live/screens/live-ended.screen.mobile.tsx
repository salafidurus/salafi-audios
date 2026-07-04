"use client";

import React from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLiveEndedScreen } from "@sd/domain-live";
import { LiveSessionRow } from "../components/live-session-row/live-session-row";
import styles from "./live.screen.module.css";

export type LiveEndedMobileScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

export function LiveEndedMobileScreen({
  onNavigateToSession,
}: LiveEndedMobileScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  const renderContent = () => {
    if (isFetching && sessions.length === 0) {
      return <div style={{ padding: 16, textAlign: "center" }}>Loading past sessions…</div>;
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
          No past sessions.
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
            Past Sessions
          </AppText>
          {renderContent()}
        </div>
      </div>
    </ScreenView>
  );
}

