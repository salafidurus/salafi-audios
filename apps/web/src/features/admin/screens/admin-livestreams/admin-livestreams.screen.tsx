"use client";

import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { LiveSessionDeltaDto } from "@sd/core-contracts";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/Button";
import { updateLiveSessionStatus } from "@/features/admin/api/admin.api";
import styles from "./admin-livestreams.screen.module.css";

type Session = LiveSessionDeltaDto["sessions"][number];

function SessionRow({
  session,
  onStatusChange,
}: {
  session: Session;
  onStatusChange: (id: string, status: string) => void;
}) {
  const getStatusBadgeClass = () => {
    if (session.status === "live") return styles.statusLive;
    if (session.status === "scheduled") return styles.statusScheduled;
    return styles.statusEnded;
  };

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>{session.title ?? "Untitled"}</td>
      <td className={styles.tableCell}>{session.channelDisplayName}</td>
      <td className={styles.tableCell}>{session.scholarName ?? "—"}</td>
      <td className={styles.tableCell}>
        <span className={`${styles.statusBadge} ${getStatusBadgeClass()}`}>{session.status}</span>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.actionButtons}>
          {session.status === "scheduled" && (
            <Button variant="primary" onClick={() => onStatusChange(session.id, "live")}>
              Go Live
            </Button>
          )}
          {session.status === "live" && (
            <Button variant="danger" onClick={() => onStatusChange(session.id, "ended")}>
              End
            </Button>
          )}
          {session.status === "ended" && (
            <Button variant="outline" onClick={() => onStatusChange(session.id, "scheduled")}>
              Reschedule
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function SessionCard({
  session,
  onStatusChange,
}: {
  session: Session;
  onStatusChange: (id: string, status: string) => void;
}) {
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

export function AdminLivestreamsScreen() {
  const isDesktop = useIsDesktop();

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
  const {
    data: endedData,
    isFetching: loadingEnded,
    refetch: refetchEnded,
  } = useApiQuery<LiveSessionDeltaDto>(
    queryKeys.live.ended(),
    () => httpClient<LiveSessionDeltaDto>({ url: endpoints.live.ended, method: "GET" }),
    { enabled: isDesktop },
  );

  const refetchAll = () => {
    refetchActive();
    refetchScheduled();
    if (isDesktop) refetchEnded();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateLiveSessionStatus(id, status);
    refetchAll();
  };

  if (loadingActive || loadingScheduled || (isDesktop && loadingEnded)) {
    return (
      <ScreenView>
        <PageHeader title={isDesktop ? "Manage Livestreams" : "Livestreams"} />
        <EmptyState variant="loading" message={isDesktop ? "Loading live sessions…" : "Loading…"} />
      </ScreenView>
    );
  }

  const active = activeData?.sessions ?? [];
  const scheduled = scheduledData?.sessions ?? [];
  const ended = endedData?.sessions ?? [];

  return (
    <ScreenView>
      <PageHeader title={isDesktop ? "Manage Livestreams" : "Livestreams"} />

      {active.length > 0 && (
        <>
          <h2 className={`${styles.sectionTitle} ${styles.activeSectionTitle}`}>
            Active ({active.length})
          </h2>
          {isDesktop ? (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHead}>Title</th>
                  <th className={styles.tableHead}>Channel</th>
                  <th className={styles.tableHead}>Scholar</th>
                  <th className={styles.tableHead}>Status</th>
                  <th className={styles.tableHead}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            active.map((session) => (
              <SessionCard key={session.id} session={session} onStatusChange={handleStatusChange} />
            ))
          )}
        </>
      )}

      <h2 className={`${styles.sectionTitle} ${styles.scheduledSectionTitle}`}>
        Scheduled ({scheduled.length})
      </h2>
      {isDesktop ? (
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHead}>Title</th>
              <th className={styles.tableHead}>Channel</th>
              <th className={styles.tableHead}>Scholar</th>
              <th className={styles.tableHead}>Status</th>
              <th className={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduled.map((session) => (
              <SessionRow key={session.id} session={session} onStatusChange={handleStatusChange} />
            ))}
          </tbody>
        </table>
      ) : (
        scheduled.map((session) => (
          <SessionCard key={session.id} session={session} onStatusChange={handleStatusChange} />
        ))
      )}

      {isDesktop && (
        <>
          <h2 className={`${styles.sectionTitle} ${styles.endedSectionTitle}`}>
            Ended ({ended.length})
          </h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHead}>Title</th>
                <th className={styles.tableHead}>Channel</th>
                <th className={styles.tableHead}>Scholar</th>
                <th className={styles.tableHead}>Status</th>
                <th className={styles.tableHead}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ended.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </tbody>
          </table>
        </>
      )}
    </ScreenView>
  );
}
