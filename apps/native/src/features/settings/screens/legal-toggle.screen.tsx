import { Column, ScrollView } from "@expo/ui";
import { useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { NativeScreenHost, NativeText } from "@/shared/ui";

import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl";

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

const TAB_OPTIONS: { value: LegalTab; label: string }[] = [
  { value: "terms", label: "Terms of Use" },
  { value: "privacy", label: "Privacy Policy" },
];

export function LegalToggleScreen() {
  const { theme } = useUnistyles();
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");

  const sections = activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const title = activeTab === "terms" ? "Terms of Use" : "Privacy Policy";

  return (
    <NativeScreenHost testID="legal-toggle-screen-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.scale.lg}
          style={{
            paddingHorizontal: theme.spacing.layout.pageX,
            paddingVertical: theme.spacing.layout.pageY,
          }}
        >
          <SegmentedControl options={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} />
          <NativeText variant="titleLg" colorRole="strong">
            {title}
          </NativeText>
          {sections.map((section) => (
            <Column key={section.heading} spacing={theme.spacing.scale.xs}>
              <NativeText variant="titleMd" colorRole="strong">
                {section.heading}
              </NativeText>
              <NativeText variant="bodyMd" colorRole="subtle">
                {section.body}
              </NativeText>
            </Column>
          ))}
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
