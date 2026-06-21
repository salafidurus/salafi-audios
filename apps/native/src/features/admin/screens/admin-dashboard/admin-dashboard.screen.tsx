import { Pressable, ScrollView, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";

type AdminDashboardScreenProps = {
  onNavigateToLectures?: () => void;
  onNavigateToLive?: () => void;
  onNavigateToScholars?: () => void;
  onNavigateToPermissions?: () => void;
};

export function AdminDashboardScreen({
  onNavigateToLectures,
  onNavigateToLive,
  onNavigateToScholars,
}: AdminDashboardScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("admin.title", "Admin Dashboard")}</Text>

      <Pressable onPress={onNavigateToLectures} style={[styles.card, styles.cardLectures]}>
        <Text style={styles.cardTitle}>{t("admin.lectures", "Lectures")}</Text>
        <Text style={styles.cardSubtitle}>{t("admin.manageAudios", "Manage audio content")}</Text>
      </Pressable>

      <Pressable onPress={onNavigateToLive} style={[styles.card, styles.cardLive]}>
        <Text style={styles.cardTitle}>{t("admin.live", "Live")}</Text>
        <Text style={styles.cardSubtitle}>{t("admin.manageSessions", "Manage live sessions")}</Text>
      </Pressable>

      <Pressable onPress={onNavigateToScholars} style={[styles.card, styles.cardScholars]}>
        <Text style={styles.cardTitle}>{t("admin.scholars", "Scholars")}</Text>
        <Text style={styles.cardSubtitle}>
          {t("admin.manageSeries", "Manage scholars & series")}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: theme.colors.content.strong,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: 12,
    borderStartWidth: 4,
  },
  cardLectures: {
    borderStartColor: theme.colors.state.danger,
  },
  cardLive: {
    borderStartColor: theme.colors.action.secondary,
  },
  cardScholars: {
    borderStartColor: theme.colors.state.success,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.content.strong,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.content.muted,
  },
}));
