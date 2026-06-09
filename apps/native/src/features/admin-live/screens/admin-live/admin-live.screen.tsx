import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
  const statusColor =
    session.status === "live" ? "#dc2626" : session.status === "scheduled" ? "#d97706" : "#6b7280";
  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ flex: 1, fontWeight: "600" }} numberOfLines={1}>
          {session.title ?? session.channelDisplayName}
        </Text>
        <View
          style={{
            backgroundColor: statusColor + "22",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: statusColor,
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {session.status}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
        {session.status === "scheduled" && (
          <Pressable
            onPress={() => onStatusChange(session.id, "live")}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: "#dc2626",
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Go Live</Text>
          </Pressable>
        )}
        {session.status === "live" && (
          <Pressable
            onPress={() => onStatusChange(session.id, "ended")}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: "#374151",
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>End</Text>
          </Pressable>
        )}
      </View>
    </View>
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

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Sessions */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: "700" }}>Sessions</Text>
        <Pressable
          onPress={() => setShowSessionSheet(true)}
          style={{ padding: 8, backgroundColor: "#3b82f6", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ New</Text>
        </Pressable>
      </View>
      {sessions.length === 0 && (
        <Text style={{ color: "#6b7280", marginBottom: 16 }}>No sessions found.</Text>
      )}
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} onStatusChange={handleStatusChange} />
      ))}

      {/* Channels */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 12 }}>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: "700" }}>Channels</Text>
        <Pressable
          onPress={() => {
            setEditingChannel(undefined);
            setShowChannelSheet(true);
          }}
          style={{ padding: 8, backgroundColor: "#3b82f6", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ New</Text>
        </Pressable>
      </View>
      {(channels ?? []).map((ch: LivestreamChannelDto) => (
        <Pressable
          key={ch.id}
          onPress={() => {
            setEditingChannel(ch);
            setShowChannelSheet(true);
          }}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "600" }}>{ch.displayName}</Text>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            {ch.telegramSlug ? `@${ch.telegramSlug}` : "Private"} · {ch.language ?? "—"} ·{" "}
            {ch.isActive ? "Active" : "Inactive"}
          </Text>
        </Pressable>
      ))}

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
