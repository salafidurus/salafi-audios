import { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "@sd/domain-live";

export type LiveScheduledScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function ScheduledItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{session.title}</Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{session.scholarName}</Text>
      {session.scheduledAt && (
        <Text style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>
          {new Date(session.scheduledAt).toLocaleString()}
        </Text>
      )}
    </Pressable>
  );
}

export function LiveScheduledScreen({ onNavigateToSession }: LiveScheduledScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();

  const handleSessionPress = useCallback(
    (id: string) => {
      onNavigateToSession?.(id);
    },
    [onNavigateToSession],
  );

  const renderItem = useCallback(
    ({ item: session }: { item: LiveSessionDto }) => (
      <ScheduledItem session={session} onPress={() => handleSessionPress(session.id)} />
    ),
    [handleSessionPress],
  );

  if (isFetching && sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading scheduled sessions…</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666", textAlign: "center" }}>
          No scheduled sessions. Check back later.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(session) => session.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
