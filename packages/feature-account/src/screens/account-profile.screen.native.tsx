import { View, Text, TextInput, ScrollView } from "react-native";
import { useAccountScreen } from "../hooks/use-account";

export type AccountProfileMobileNativeScreenProps = {
  onBack?: () => void;
};

export function AccountProfileMobileNativeScreen({}: AccountProfileMobileNativeScreenProps) {
  const { profile, isFetching } = useAccountScreen();

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Profile not available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Edit Profile</Text>
      <View style={{ marginTop: 20, gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "600" }}>Display Name</Text>
          <TextInput
            defaultValue={profile.displayName || ""}
            placeholder="Your display name"
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: "#d4d4d4",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "600" }}>Email</Text>
          <TextInput
            defaultValue={profile.email}
            editable={false}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: "#d4d4d4",
              borderRadius: 6,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
