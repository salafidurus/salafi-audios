import { View, Text, ScrollView } from "react-native";

export function PrivacyMobileNativeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>Privacy Policy</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>
          Information We Collect
        </Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          We collect information you provide when creating an account and usage data such as
          listening history. We do not sell your personal information.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>
          How We Use Your Information
        </Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          Your information is used to provide the service, personalize your experience, and
          communicate important updates.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>
          Data Storage &amp; Security
        </Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          Your data is stored securely with industry-standard encryption. We retain your data only
          while your account is active.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>Contact</Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>privacy@salafidurus.com</Text>
      </View>
    </ScrollView>
  );
}
