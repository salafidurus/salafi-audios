import { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "@sd/domain-live";
import { useTranslation } from "@/core/i18n/use-translation";
import { LiveSkeleton } from "../components/live-skeleton/live-skeleton";

export type LiveScheduledScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function ScheduledItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.scholar}>{session.scholarName}</Text>
      {session.scheduledAt && (
        <Text style={styles.scheduledTime}>{new Date(session.scheduledAt).toLocaleString()}</Text>
      )}
    </Pressable>
  );
}

export function LiveScheduledScreen({ onNavigateToSession }: LiveScheduledScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();
  const { t } = useTranslation();

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
      <View style={styles.skeletonWrap}>
        <LiveSkeleton />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t("live.sections.scheduled.empty", "No upcoming sessions scheduled.")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(session) => session.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  scholar: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  scheduledTime: {
    fontSize: 12,
    color: theme.colors.content.primary,
    marginTop: 2,
  },
  skeletonWrap: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  listContent: {
    padding: 8,
  },
}));
