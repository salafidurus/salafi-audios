"use client";

import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { LiveSessionDeltaDto } from "@sd/core-contracts";
import { updateLiveSessionStatus } from "../../api/admin.api";

export function AdminLivestreamsDesktopWebScreen() {
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
  } = useApiQuery<LiveSessionDeltaDto>(queryKeys.live.ended(), () =>
    httpClient<LiveSessionDeltaDto>({ url: endpoints.live.ended, method: "GET" }),
  );

  const refetchAll = () => {
    refetchActive();
    refetchScheduled();
    refetchEnded();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateLiveSessionStatus(id, status);
    refetchAll();
  };

  if (loadingActive || loadingScheduled || loadingEnded) {
    return <div style={{ padding: 32 }}>Loading live sessions...</div>;
  }

  const active = activeData?.sessions ?? [];
  const scheduled = scheduledData?.sessions ?? [];
  const ended = endedData?.sessions ?? [];

  const renderSession = (session: LiveSessionDeltaDto["sessions"][number]) => (
    <tr key={session.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
      <td style={{ padding: 8 }}>{session.title ?? "Untitled"}</td>
      <td style={{ padding: 8 }}>{session.channelDisplayName}</td>
      <td style={{ padding: 8 }}>{session.scholarName ?? "—"}</td>
      <td style={{ padding: 8 }}>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 12,
            background:
              session.status === "live"
                ? "#dcfce7"
                : session.status === "scheduled"
                  ? "#dbeafe"
                  : "#f3f4f6",
            color:
              session.status === "live"
                ? "#16a34a"
                : session.status === "scheduled"
                  ? "#2563eb"
                  : "#666",
          }}
        >
          {session.status}
        </span>
      </td>
      <td style={{ padding: 8 }}>
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
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Go Live
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
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              End
            </button>
          )}
          {session.status === "ended" && (
            <button
              onClick={() => handleStatusChange(session.id, "scheduled")}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Reschedule
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Manage Livestreams</h1>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#16a34a" }}>
        Active ({active.length})
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Channel</th>
            <th style={{ padding: 8 }}>Scholar</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>{active.map(renderSession)}</tbody>
      </table>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#2563eb" }}>
        Scheduled ({scheduled.length})
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Channel</th>
            <th style={{ padding: 8 }}>Scholar</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>{scheduled.map(renderSession)}</tbody>
      </table>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#666" }}>
        Ended ({ended.length})
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Channel</th>
            <th style={{ padding: 8 }}>Scholar</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>{ended.map(renderSession)}</tbody>
      </table>
    </div>
  );
}
