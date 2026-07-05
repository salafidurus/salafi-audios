import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function TermsOfUseScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Use</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Acceptance of Terms</Text>
        <Text style={styles.body}>
          By using Salafi Durus, you agree to these Terms. If you do not agree, do not use the
          service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Use of the Service</Text>
        <Text style={styles.body}>
          Content is for personal, non-commercial use. Do not redistribute or commercially exploit
          the content.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>User Accounts</Text>
        <Text style={styles.body}>
          You are responsible for your account credentials and all activity under your account.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Content &amp; IP</Text>
        <Text style={styles.body}>
          Audio content belongs to the scholars. Platform design and code belong to Salafi Durus.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Contact</Text>
        <Text style={styles.body}>legal@salafidurus.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.scale.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: theme.spacing.scale.lg,
    color: theme.colors.content.strong,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
    color: theme.colors.content.strong,
  },
  body: {
    color: theme.colors.content.subtle,
    lineHeight: 22,
  },
}));
