"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveEndedScreen } from "@sd/domain-live";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./live-ended.screen.mobile.module.css";

export type LiveEndedMobileScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function EndedSessionItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <button type="button" onClick={onPress} className={styles.sessionItem}>
      <div className={styles.sessionTitle}>{session.title}</div>
      <div className={styles.sessionMeta}>{session.scholarName}</div>
      {session.endedAt && (
        <div className={styles.sessionDate}>{new Date(session.endedAt).toLocaleDateString()}</div>
      )}
    </button>
  );
}

export function LiveEndedMobileScreen({ onNavigateToSession }: LiveEndedMobileScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  return (
    <ScreenView>
      {isFetching && sessions.length === 0 ? (
        <p>Loading past sessions…</p>
      ) : sessions.length === 0 ? (
        <p>No past sessions.</p>
      ) : (
        <>
          <h2 className={styles.title}>Past Sessions</h2>
          {sessions.map((session) => (
            <EndedSessionItem
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
