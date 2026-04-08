import { View, Text, ScrollView } from "react-native";

export function TermsOfUseMobileNativeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>Terms of Use</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>
          Acceptance of Terms
        </Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          By using Salafi Durus, you agree to these Terms. If you do not agree, do not use the
          service.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>Use of the Service</Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          Content is for personal, non-commercial use. Do not redistribute or commercially exploit
          the content.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>User Accounts</Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          You are responsible for your account credentials and all activity under your account.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>Content &amp; IP</Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>
          Audio content belongs to the scholars. Platform design and code belong to Salafi Durus.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 6 }}>Contact</Text>
        <Text style={{ color: "#555", lineHeight: 22 }}>legal@salafidurus.com</Text>
      </View>
    </ScrollView>
  );
}
