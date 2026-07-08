"use client";

import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { LiveSessionDeltaDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/Button";
import { updateLiveSessionStatus } from "@/features/admin/api/admin.api";
import styles from "./admin-livestreams.screen.mobile.module.css";

type Session = LiveSessionDeltaDto["sessions"][number];

type SessionCardProps = {
  session: Session;
  onStatusChange: (id: string, status: string) => void;
};

function SessionCard({ session, onStatusChange }: SessionCardProps) {
  return (
    <div className={styles.sessionCard}>
      <div className={styles.sessionCardContent}>
        <div className={styles.sessionInfo}>
          <div className={styles.sessionTitle}>{session.title ?? "Untitled"}</div>
          <div className={styles.sessionDetails}>
            {session.channelDisplayName} · {session.scholarName ?? "—"}
          </div>
        </div>
        <div className={styles.actionButtons}>
          {session.status === "scheduled" && (
            <Button variant="primary" onClick={() => onStatusChange(session.id, "live")}>
              Live
            </Button>
          )}
          {session.status === "live" && (
            <Button variant="danger" onClick={() => onStatusChange(session.id, "ended")}>
              End
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminLivestreamsMobileScreen() {
  const {
    data: activeData,
    isFetching: loadingActive,
    refetch: refetchActive,
  } = useApiQuery<LiveSessionDeltaDto>(queryKeys.live.active(), () =>
    httpClient<LiveSessionDeltaDto>({ url: endpoints.live.active, method: "GET" }),
  );
  const {
    data: scheduledData,
    isFetching: loadingScheduled,
    refetch: refetchScheduled,
  } = useApiQuery<LiveSessionDeltaDto>(queryKeys.live.scheduled(), () =>
    httpClient<LiveSessionDeltaDto>({ url: endpoints.live.upcoming, method: "GET" }),
  );

  const refetchAll = () => {
    refetchActive();
    refetchScheduled();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateLiveSessionStatus(id, status);
    refetchAll();
  };

  if (loadingActive || loadingScheduled) {
    return (
      <ScreenView>
        <PageHeader title="Livestreams" />
        <EmptyState variant="loading" message="Loading…" />
      </ScreenView>
    );
  }

  const active = activeData?.sessions ?? [];
  const scheduled = scheduledData?.sessions ?? [];

  return (
    <ScreenView>
      <PageHeader title="Livestreams" />
      {active.length > 0 && (
        <>
          <h2 className={`${styles.sectionTitle} ${styles.activeSectionTitle}`}>
            Active ({active.length})
          </h2>
          {active.map((session) => (
            <SessionCard key={session.id} session={session} onStatusChange={handleStatusChange} />
          ))}
        </>
      )}
      <h2 className={`${styles.sectionTitle} ${styles.scheduledSectionTitle}`}>
        Scheduled ({scheduled.length})
      </h2>
      {scheduled.map((session) => (
        <SessionCard key={session.id} session={session} onStatusChange={handleStatusChange} />
      ))}
    </ScreenView>
  );
}
