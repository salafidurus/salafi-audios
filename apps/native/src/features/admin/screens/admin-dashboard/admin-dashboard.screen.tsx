import { Pressable, ScrollView, Text } from "react-native";
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        {t("admin.title", "Admin Dashboard")}
      </Text>

      <Pressable
        onPress={onNavigateToLectures}
        style={{
          padding: 16,
          marginBottom: 12,
          backgroundColor: "#f3f4f6",
          borderRadius: 12,
          borderStartWidth: 4,
          borderStartColor: "#ef4444",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
          {t("admin.lectures", "Lectures")}
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>
          {t("admin.manageAudios", "Manage audio content")}
        </Text>
      </Pressable>

      <Pressable
        onPress={onNavigateToLive}
        style={{
          padding: 16,
          marginBottom: 12,
          backgroundColor: "#f3f4f6",
          borderRadius: 12,
          borderStartWidth: 4,
          borderStartColor: "#f59e0b",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
          {t("admin.live", "Live")}
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>
          {t("admin.manageSessions", "Manage live sessions")}
        </Text>
      </Pressable>

      <Pressable
        onPress={onNavigateToScholars}
        style={{
          padding: 16,
          marginBottom: 12,
          backgroundColor: "#f3f4f6",
          borderRadius: 12,
          borderStartWidth: 4,
          borderStartColor: "#10b981",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
          {t("admin.scholars", "Scholars")}
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>
          {t("admin.manageSeries", "Manage scholars & series")}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
