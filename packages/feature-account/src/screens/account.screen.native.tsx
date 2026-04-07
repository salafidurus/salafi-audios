import { View, Text, Pressable, ScrollView } from "react-native";
import { useAccountScreen } from "../hooks/use-account";

export type AccountMobileNativeScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountMobileNativeScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onSignOut,
}: AccountMobileNativeScreenProps) {
  const { profile, isFetching } = useAccountScreen();

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading account...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Account</Text>
      {profile && (
        <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{profile.displayName || "User"}</Text>
            <Text style={{ fontSize: 13, color: "#666" }}>{profile.email}</Text>
          </View>
        </View>
      )}
      <View style={{ marginTop: 24, gap: 8 }}>
        <Pressable
          onPress={onNavigateToProfile}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 15 }}>Edit Profile</Text>
        </Pressable>
        <Pressable
          onPress={onNavigateToLegal}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 15 }}>Legal</Text>
        </Pressable>
        <Pressable
          onPress={onSignOut}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 15, color: "#dc2626" }}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
