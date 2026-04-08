import { View, ScrollView, Text, Pressable } from "react-native";
import { ADMIN_PERMISSIONS } from "@sd/core-contracts";
import { useAdminPermissions } from "../../hooks/use-admin-permissions";

export function AdminPermissionsMobileNativeScreen() {
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const permissions = data?.permissions ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Permissions</Text>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
        Your current admin permissions:
      </Text>
      {ADMIN_PERMISSIONS.map((perm) => {
        const hasIt = permissions.includes(perm);
        return (
          <Pressable
            key={perm}
            style={{
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: hasIt ? "#bbf7d0" : "#e0e0e0",
              backgroundColor: hasIt ? "#f0fdf4" : "#fff",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontFamily: "monospace", fontSize: 14 }}>{perm}</Text>
            <Text style={{ fontSize: 11, color: hasIt ? "#16a34a" : "#999", marginTop: 4 }}>
              {hasIt ? "Granted" : "Not granted"}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
