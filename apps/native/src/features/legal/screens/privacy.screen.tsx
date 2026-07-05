import { View, Text, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function PrivacyScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide when creating an account and usage data such as
          listening history. We do not sell your personal information.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>How We Use Your Information</Text>
        <Text style={styles.body}>
          Your information is used to provide the service, personalize your experience, and
          communicate important updates.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Data Storage &amp; Security</Text>
        <Text style={styles.body}>
          Your data is stored securely with industry-standard encryption. We retain your data only
          while your account is active.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Contact</Text>
        <Text style={styles.body}>privacy@salafidurus.com</Text>
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
