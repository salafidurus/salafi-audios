import { View, Text, TouchableOpacity, FlatList } from "react-native";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "../hooks/use-live-scheduled";

export type LiveScheduledMobileNativeScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function ScheduledItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{session.title}</Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{session.scholarName}</Text>
      {session.scheduledAt && (
        <Text style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>
          {new Date(session.scheduledAt).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function LiveScheduledMobileNativeScreen({
  onNavigateToSession,
}: LiveScheduledMobileNativeScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();

  if (isFetching && sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading scheduled sessions...</Text>
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
      renderItem={({ item: session }) => (
        <ScheduledItem session={session} onPress={() => onNavigateToSession?.(session.id)} />
      )}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
