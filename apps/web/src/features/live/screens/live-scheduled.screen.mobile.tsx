"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "@sd/domain-live";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./live-scheduled.screen.mobile.module.css";

export type LiveScheduledMobileScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function ScheduledSessionItem({
  session,
  onPress,
}: {
  session: LiveSessionDto;
  onPress?: () => void;
}) {
  return (
    <button type="button" onClick={onPress} className={styles.sessionItem}>
      <div className={styles.sessionTitle}>{session.title}</div>
      <div className={styles.sessionMeta}>{session.scholarName}</div>
      {session.scheduledAt && (
        <div className={styles.sessionDate}>{new Date(session.scheduledAt).toLocaleString()}</div>
      )}
    </button>
  );
}

export function LiveScheduledMobileScreen({ onNavigateToSession }: LiveScheduledMobileScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();

  return (
    <ScreenView>
      {isFetching && sessions.length === 0 ? (
        <p>Loading scheduled sessions…</p>
      ) : sessions.length === 0 ? (
        <p>No scheduled sessions.</p>
      ) : (
        <>
          <h2 className={styles.title}>Scheduled</h2>
          {sessions.map((session) => (
            <ScheduledSessionItem
              key={session.id}
              session={session}
              onPress={() => onNavigateToSession?.(session.id)}
            />
          ))}
        </>
      )}
    </ScreenView>
  );
}
