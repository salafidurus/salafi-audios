"use client";

import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { LiveSessionDeltaDto } from "@sd/core-contracts";
import { updateLiveSessionStatus } from "../../api/admin.api";

export function AdminLivestreamsMobileWebScreen() {
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
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  const active = activeData?.sessions ?? [];
  const scheduled = scheduledData?.sessions ?? [];

  const renderSession = (session: LiveSessionDeltaDto["sessions"][number]) => (
    <div key={session.id} style={{ padding: 12, borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600 }}>{session.title ?? "Untitled"}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {session.channelDisplayName} · {session.scholarName ?? "—"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {session.status === "scheduled" && (
            <button
              onClick={() => handleStatusChange(session.id, "live")}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "none",
                background: "#16a34a",
                color: "#fff",
                fontSize: 11,
              }}
            >
              Live
            </button>
          )}
          {session.status === "live" && (
            <button
              onClick={() => handleStatusChange(session.id, "ended")}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "none",
                background: "#dc2626",
                color: "#fff",
                fontSize: 11,
              }}
            >
              End
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Livestreams</h1>
      {active.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#16a34a", marginBottom: 8 }}>
            Active ({active.length})
          </h2>
          {active.map(renderSession)}
        </>
      )}
      <h2
        style={{ fontSize: 16, fontWeight: 600, color: "#2563eb", marginBottom: 8, marginTop: 16 }}
      >
        Scheduled ({scheduled.length})
      </h2>
      {scheduled.map(renderSession)}
    </div>
  );
}
