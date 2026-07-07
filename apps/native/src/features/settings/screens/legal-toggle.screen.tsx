import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

// Terms of Use content
const TERMS_SECTIONS = [
  {
    heading: "Acceptance of Terms",
    body: "By using Salafi Durus, you agree to these Terms. If you do not agree, do not use the service.",
  },
  {
    heading: "Use of the Service",
    body: "Content is for personal, non-commercial use. Do not redistribute or commercially exploit the content.",
  },
  {
    heading: "User Accounts",
    body: "You are responsible for your account credentials and all activity under your account.",
  },
  {
    heading: "Content & IP",
    body: "Audio content belongs to the scholars. Platform design and code belong to Salafi Durus.",
  },
  {
    heading: "Contact",
    body: "legal@salafidurus.com",
  },
];

// Privacy Policy content
const PRIVACY_SECTIONS = [
  {
    heading: "Information We Collect",
    body: "We collect information you provide when creating an account and usage data such as listening history. We do not sell your personal information.",
  },
  {
    heading: "How We Use Your Information",
    body: "Your information is used to provide the service, personalize your experience, and communicate important updates.",
  },
  {
    heading: "Data Storage & Security",
    body: "Your data is stored securely with industry-standard encryption. We retain your data only while your account is active.",
  },
  {
    heading: "Contact",
    body: "privacy@salafidurus.com",
  },
];

type LegalTab = "terms" | "privacy";

export function LegalToggleScreen() {
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");
  const styles = StyleSheet.create((theme) => ({
    container: {
      flex: 1,
    },
    controlContainer: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    segmentedControl: {
      height: 32,
    },
    tabsContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabButtonActive: {
      borderBottomColor: theme.colors.action.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.content.muted,
    },
    tabTextActive: {
      color: theme.colors.action.primary,
    },
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

  const sections = activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const title = activeTab === "terms" ? "Terms of Use" : "Privacy Policy";

  return (
    <View style={styles.container}>
      {/* Text tabs for both platforms */}
      <View style={styles.tabsContainer}>
        <View style={[styles.tabButton, activeTab === "terms" && styles.tabButtonActive]}>
          <Text
            style={[styles.tabText, activeTab === "terms" && styles.tabTextActive]}
            onPress={() => setActiveTab("terms")}
          >
            Terms
          </Text>
        </View>
        <View style={[styles.tabButton, activeTab === "privacy" && styles.tabButtonActive]}>
          <Text
            style={[styles.tabText, activeTab === "privacy" && styles.tabTextActive]}
            onPress={() => setActiveTab("privacy")}
          >
            Privacy
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
