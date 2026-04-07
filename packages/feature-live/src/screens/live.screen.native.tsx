import { View, Text, TouchableOpacity, FlatList } from "react-native";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveActiveScreen } from "../hooks/use-live-active";

export type LiveMobileNativeScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function LiveSessionItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#dc2626" }} />
        <Text style={{ fontSize: 15, fontWeight: "600" }}>{session.title}</Text>
      </View>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {session.scholarName}
        {session.viewerCount !== undefined ? ` · ${session.viewerCount} watching` : ""}
      </Text>
    </TouchableOpacity>
  );
}

export function LiveMobileNativeScreen({ onNavigateToSession }: LiveMobileNativeScreenProps) {
  const { sessions, isFetching } = useLiveActiveScreen();

  if (isFetching && sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading live sessions...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666", textAlign: "center" }}>
          No live sessions right now. Check the schedule for upcoming sessions.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(session) => session.id}
      renderItem={({ item: session }) => (
        <LiveSessionItem session={session} onPress={() => onNavigateToSession?.(session.id)} />
      )}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
