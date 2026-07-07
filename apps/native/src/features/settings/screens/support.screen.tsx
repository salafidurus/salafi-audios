import { View, Text, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

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

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: theme.colors.content.strong,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    color: theme.colors.content.strong,
  },
  itemContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surface.subtle,
  },
  itemQuestion: {
    fontWeight: "600",
    marginBottom: 2,
    color: theme.colors.content.strong,
  },
  itemAnswer: {
    color: theme.colors.content.muted,
    lineHeight: 20,
  },
}));

export function SupportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Support</Text>
      {/* react-doctor-disable-next-line react-doctor/rn-no-scrollview-mapped-list */}
      {SUPPORT_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item.q} style={styles.itemContainer}>
              <Text style={styles.itemQuestion}>{item.q}</Text>
              <Text style={styles.itemAnswer}>{item.a}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
