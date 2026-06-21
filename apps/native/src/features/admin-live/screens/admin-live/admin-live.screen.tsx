import { useCallback, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { LivestreamChannelDto, LiveSessionPublicDto } from "@sd/core-contracts";
import { useAdminChannels, useAdminSessions } from "../../hooks/use-admin-live";
import { updateSessionStatus } from "../../api/admin-live.api";
import { ChannelSheet } from "../../components/ChannelSheet/ChannelSheet";
import { SessionSheet } from "../../components/SessionSheet/SessionSheet";

function SessionRow({
  session,
  onStatusChange,
}: {
  session: LiveSessionPublicDto;
  onStatusChange: (id: string, status: "live" | "ended") => void;
}) {
  const { theme } = useUnistyles();
  const statusColor =
    session.status === "live"
      ? theme.colors.state.danger
      : session.status === "scheduled"
        ? theme.colors.action.secondary
        : theme.colors.content.muted;
  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionRowHeader}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {session.title ?? session.channelDisplayName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{session.status}</Text>
        </View>
      </View>
      <View style={styles.sessionActions}>
        {session.status === "scheduled" && (
          <Pressable onPress={() => onStatusChange(session.id, "live")} style={styles.goLiveBtn}>
            <Text style={[styles.actionBtnText, styles.goLiveBtnText]}>Go Live</Text>
          </Pressable>
        )}
        {session.status === "live" && (
          <Pressable onPress={() => onStatusChange(session.id, "ended")} style={styles.endBtn}>
            <Text style={[styles.actionBtnText, styles.endBtnText]}>End</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

type ChannelRowProps = {
  channel: LivestreamChannelDto;
  onPress: (channel: LivestreamChannelDto) => void;
};

function ChannelRow({ channel, onPress }: ChannelRowProps) {
  return (
    <Pressable onPress={() => onPress(channel)} style={styles.channelRow}>
      <Text style={styles.channelName}>{channel.displayName}</Text>
      <Text style={styles.channelMeta}>
        {channel.telegramSlug ? `@${channel.telegramSlug}` : "Private"} · {channel.language ?? "—"}{" "}
        · {channel.isActive ? "Active" : "Inactive"}
      </Text>
    </Pressable>
  );
}

export function AdminLiveScreen() {
  const { data: sessionsData, refetch: refetchSessions } = useAdminSessions();
  const { data: channels, refetch: refetchChannels } = useAdminChannels();
  const [showChannelSheet, setShowChannelSheet] = useState(false);
  const [editingChannel, setEditingChannel] = useState<LivestreamChannelDto | undefined>();
  const [showSessionSheet, setShowSessionSheet] = useState(false);
  const sessions = sessionsData?.sessions ?? [];

  const handleStatusChange = async (id: string, status: "live" | "ended") => {
    await updateSessionStatus(id, status);
    refetchSessions();
  };

  const handleChannelPress = useCallback((channel: LivestreamChannelDto) => {
    setEditingChannel(channel);
    setShowChannelSheet(true);
  }, []);

  const renderSessionItem = useCallback(
    ({ item: s }: { item: LiveSessionPublicDto }) => (
      <SessionRow session={s} onStatusChange={handleStatusChange} />
    ),
    [],
  );

  const renderChannelItem = useCallback(
    ({ item: ch }: { item: LivestreamChannelDto }) => (
      <ChannelRow channel={ch} onPress={handleChannelPress} />
    ),
    [handleChannelPress],
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {/* Sessions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sessions</Text>
        <Pressable onPress={() => setShowSessionSheet(true)} style={styles.newBtn}>
          <Text style={styles.newBtnText}>+ New</Text>
        </Pressable>
      </View>
      {sessions.length === 0 && <Text style={styles.emptyText}>No sessions found.</Text>}
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        scrollEnabled={false}
        renderItem={renderSessionItem}
      />

      {/* Channels */}
      <View style={[styles.sectionHeader, styles.sectionHeaderSpacing]}>
        <Text style={styles.sectionTitle}>Channels</Text>
        <Pressable
          onPress={() => {
            setEditingChannel(undefined);
            setShowChannelSheet(true);
          }}
          style={styles.newBtn}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </Pressable>
      </View>
      <FlatList
        data={channels ?? []}
        keyExtractor={(ch) => ch.id}
        scrollEnabled={false}
        renderItem={renderChannelItem}
      />

      <ChannelSheet
        isOpen={showChannelSheet}
        channel={editingChannel}
        onClose={() => setShowChannelSheet(false)}
        onSaved={() => {
          setShowChannelSheet(false);
          refetchChannels();
        }}
      />
      <SessionSheet
        isOpen={showSessionSheet}
        channels={channels ?? []}
        onClose={() => setShowSessionSheet(false)}
        onSaved={() => {
          setShowSessionSheet(false);
          refetchSessions();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderSpacing: {
    marginTop: 24,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.content.strong,
  },
  newBtn: {
    padding: 8,
    backgroundColor: theme.colors.action.primary,
    borderRadius: 8,
  },
  newBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  emptyText: {
    color: theme.colors.content.muted,
    marginBottom: 16,
  },
  sessionRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionTitle: {
    flex: 1,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  sessionActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  goLiveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.colors.action.danger,
    borderRadius: 6,
  },
  goLiveBtnText: {
    color: theme.colors.content.onDanger,
  },
  endBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.colors.surface.inverse,
    borderRadius: 6,
  },
  endBtnText: {
    color: theme.colors.content.inverse,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  channelRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 8,
    marginBottom: 8,
  },
  channelName: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  channelMeta: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
}));
