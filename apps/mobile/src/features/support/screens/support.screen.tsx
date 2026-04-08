import { View, Text, ScrollView } from "react-native";

const SUPPORT_SECTIONS = [
  {
    title: "FAQ",
    items: [
      {
        q: "What is Salafi Durus?",
        a: "A platform for authentic Islamic audio lectures from trusted scholars following the Salafi methodology.",
      },
      {
        q: "How do I save lectures?",
        a: "Tap the bookmark icon on any lecture to add it to your Library.",
      },
      {
        q: "Can I listen offline?",
        a: "Yes — download lectures using the download button. They'll be available without internet.",
      },
      {
        q: "How do I follow a scholar?",
        a: "Visit a scholar's profile and tap Follow.",
      },
    ],
  },
  {
    title: "Contact",
    items: [
      { q: "Email", a: "support@salafidurus.com" },
      { q: "Response time", a: "We aim to respond within 48 hours." },
    ],
  },
];

export function SupportMobileNativeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>Support</Text>
      {SUPPORT_SECTIONS.map((section) => (
        <View key={section.title} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 8 }}>{section.title}</Text>
          {section.items.map((item) => (
            <View
              key={item.q}
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontWeight: "600", marginBottom: 2 }}>{item.q}</Text>
              <Text style={{ color: "#555", lineHeight: 20 }}>{item.a}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
