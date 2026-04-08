import { View, ScrollView, Text, Pressable } from "react-native";
import type { AdminPermission } from "@sd/core-contracts";
import { useAdminPermissions } from "../../hooks/use-admin-permissions";

type AdminSection = {
  title: string;
  description: string;
  route: string;
  permission: AdminPermission;
};

const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: "Scholars",
    description: "Manage scholars",
    route: "admin/scholars",
    permission: "manage:scholars",
  },
  {
    title: "Topics",
    description: "Manage topics",
    route: "admin/topics",
    permission: "manage:topics",
  },
  {
    title: "Livestreams",
    description: "Manage livestreams",
    route: "admin/livestreams",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage permissions",
    route: "admin/permissions",
    permission: "manage:admin",
  },
];

export function AdminDashboardMobileNativeScreen() {
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = ADMIN_SECTIONS.filter((s) => permissions.includes(s.permission));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Admin</Text>
      {visibleSections.map((section) => (
        <Pressable
          key={section.route}
          style={{
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e0e0e0",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>{section.title}</Text>
          <Text style={{ fontSize: 13, color: "#666" }}>{section.description}</Text>
        </Pressable>
      ))}
      {visibleSections.length === 0 && <Text style={{ color: "#999" }}>No admin permissions.</Text>}
    </ScrollView>
  );
}
