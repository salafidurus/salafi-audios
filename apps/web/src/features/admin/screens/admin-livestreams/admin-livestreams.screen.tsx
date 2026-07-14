"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { Search } from "@/shared/components/Search";
import { EmptyState } from "@/shared/components/EmptyState";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { LiveSessionPublicDto, LivestreamChannelDto } from "@sd/core-contracts";
import {
  createLivestreamChannel,
  updateLivestreamChannel,
  deleteLivestreamChannel,
  createLiveSession,
  deleteLiveSession,
  updateLiveSessionStatus,
} from "../../api/admin.api";
import {
  LivestreamItem,
  LivestreamChannelModal,
  LivestreamScheduleModal,
  LivestreamStatusModal,
} from "../../components/Livestream";
import styles from "./admin-livestreams.screen.module.css";

const SESSION_STATUS_CHIPS = [
  { id: "all", label: "All Sessions" },
  { id: "live", label: "Live Now" },
  { id: "scheduled", label: "Scheduled" },
  { id: "ended", label: "Ended" },
];

export function AdminLivestreamsScreen() {
  const isDesktop = useIsDesktop();
  const pathname = usePathname();

  // Determine active tab based on path suffix
  const activeSubtab = pathname.endsWith("/channels") ? "channels" : "sessions";

  // Permission Check
  const { data: adminPermissionsData } = useAdminPermissions();
  const hasEditPermission = adminPermissionsData?.permissions?.includes("LIVE_EDIT") ?? false;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "scheduled" | "ended">("all");

  // Modal State
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<LivestreamChannelDto | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSessionPublicDto | null>(null);

  // Queries
  const {
    data: sessionsData,
    isFetching: loadingSessions,
    refetch: refetchSessions,
  } = useApiQuery<LiveSessionPublicDto[]>(
    ["admin", "live", "sessions"],
    () =>
      httpClient<LiveSessionPublicDto[]>({
        url: endpoints.admin.live.listSessions,
        method: "GET",
      }),
    { enabled: activeSubtab === "sessions" },
  );

  const {
    data: channelsData,
    isFetching: loadingChannels,
    refetch: refetchChannels,
  } = useApiQuery<{ channels: LivestreamChannelDto[] }>(
    ["admin", "live", "channels"],
    () =>
      httpClient<{ channels: LivestreamChannelDto[] }>({
        url: endpoints.admin.live.listChannels,
        method: "GET",
      }),
    { enabled: activeSubtab === "channels" },
  );

  const sessions = sessionsData ?? [];
  const channels = channelsData?.channels ?? [];

  // Mutations
  const handleSaveChannel = async (formData: any) => {
    if (selectedChannel) {
      await updateLivestreamChannel(selectedChannel.id, formData);
    } else {
      await createLivestreamChannel(formData);
    }
    refetchChannels();
  };

  const handleSaveSchedule = async (formData: any) => {
    await createLiveSession(formData);
    refetchSessions();
  };

  const handleSaveStatus = async (status: any) => {
    if (selectedSession) {
      await updateLiveSessionStatus(selectedSession.id, status);
    }
    refetchSessions();
  };

  const handleDeleteChannel = async (id: string) => {
    if (confirm("Are you sure you want to delete this livestream channel?")) {
      await deleteLivestreamChannel(id);
      refetchChannels();
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm("Are you sure you want to delete this live session?")) {
      await deleteLiveSession(id);
      refetchSessions();
    }
  };

  // Header Actions
  const headerActions = [];
  if (hasEditPermission) {
    if (activeSubtab === "channels") {
      headerActions.push(
        <PermissionGate key="add-channel" requires="LIVE_EDIT">
          <Button
            variant="primary"
            size={isDesktop ? "md" : "sm"}
            icon={<Plus size={isDesktop ? 18 : 16} />}
            onClick={() => {
              setSelectedChannel(null);
              setIsChannelModalOpen(true);
            }}
          >
            {isDesktop ? "Add Channel" : "Add"}
          </Button>
        </PermissionGate>,
      );
    } else {
      headerActions.push(
        <PermissionGate key="add-schedule" requires="LIVE_EDIT">
          <Button
            variant="primary"
            size={isDesktop ? "md" : "sm"}
            icon={<Plus size={isDesktop ? 18 : 16} />}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            {isDesktop ? "Add Schedule" : "Add"}
          </Button>
        </PermissionGate>,
      );
    }
  }

  // Filter & Search Logic
  let totalCount = 0;
  let filteredItems: any[] = [];

  if (activeSubtab === "sessions") {
    const filteredSessions = sessions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          s.title?.toLowerCase().includes(query) ||
          s.channelDisplayName.toLowerCase().includes(query) ||
          s.scholarName?.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort: most recent to least recent
    filteredItems = filteredSessions.toSorted((a, b) => {
      const dateA = new Date(a.startedAt || a.scheduledAt || a.updatedAt).getTime();
      const dateB = new Date(b.startedAt || b.scheduledAt || b.updatedAt).getTime();
      return dateB - dateA;
    });
    totalCount = filteredItems.length;
  } else {
    filteredItems = channels.filter((c) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          c.displayName.toLowerCase().includes(query) ||
          c.telegramSlug?.toLowerCase().includes(query) ||
          c.scholarName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
    totalCount = filteredItems.length;
  }

  const isFetching = activeSubtab === "sessions" ? loadingSessions : loadingChannels;
  const hasDataLoaded = activeSubtab === "sessions" ? !!sessionsData : !!channelsData;

  return (
    <ScreenView>
      <PageHeader
        title={isDesktop ? "Manage Livestreams" : "Livestreams"}
        actions={headerActions}
      />

      <div className={styles.content}>
        <div className={styles.searchRow}>
          <Search.Bar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              activeSubtab === "channels"
                ? "Search channels by name..."
                : "Search sessions by title, channel or scholar..."
            }
          />
        </div>

        {activeSubtab === "sessions" && (
          <Search.Filter
            chips={SESSION_STATUS_CHIPS}
            selected={[statusFilter]}
            onChipChange={(chipId: string) => setStatusFilter(chipId as any)}
          />
        )}

        {isFetching && !hasDataLoaded ? (
          <EmptyState variant="loading" message="Loading..." />
        ) : (
          <>
            <div className={styles.toolbar}>
              <p className={styles.resultCount}>
                {totalCount}{" "}
                {activeSubtab === "sessions"
                  ? `session${totalCount !== 1 ? "s" : ""}`
                  : `channel${totalCount !== 1 ? "s" : ""}`}{" "}
                found
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <EmptyState
                message={
                  searchQuery || statusFilter !== "all" ? "No matches found." : "No items found."
                }
              />
            ) : (
              <List>
                {filteredItems.map((item) => (
                  <LivestreamItem
                    key={item.id}
                    type={activeSubtab === "sessions" ? "session" : "channel"}
                    item={item}
                    onEdit={() => {
                      if (activeSubtab === "sessions") {
                        setSelectedSession(item);
                        setIsStatusModalOpen(true);
                      } else {
                        setSelectedChannel(item);
                        setIsChannelModalOpen(true);
                      }
                    }}
                    onDelete={() => {
                      if (activeSubtab === "sessions") {
                        handleDeleteSession(item.id);
                      } else {
                        handleDeleteChannel(item.id);
                      }
                    }}
                  />
                ))}
              </List>
            )}
          </>
        )}
      </div>

      {/* Conditionally render Modals to enforce complete unmount/reset */}
      {isChannelModalOpen && (
        <LivestreamChannelModal
          isOpen={isChannelModalOpen}
          onClose={() => {
            setIsChannelModalOpen(false);
            setSelectedChannel(null);
          }}
          onSave={handleSaveChannel}
          channel={selectedChannel}
        />
      )}

      {isScheduleModalOpen && (
        <LivestreamScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSave={handleSaveSchedule}
        />
      )}

      {isStatusModalOpen && selectedSession && (
        <LivestreamStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedSession(null);
          }}
          onSave={handleSaveStatus}
          session={selectedSession}
        />
      )}
    </ScreenView>
  );
}
