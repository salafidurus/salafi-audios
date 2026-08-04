import { Column, ScrollView } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { NativeScreenHost, NativeText } from "@/shared/ui";

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

export function SupportScreen() {
  const { theme } = useUnistyles();

  return (
    <NativeScreenHost testID="support-screen-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.scale.lg}
          style={{
            paddingHorizontal: theme.spacing.layout.pageX,
            paddingVertical: theme.spacing.layout.pageY,
          }}
        >
          <NativeText variant="titleLg" colorRole="strong">
            Support
          </NativeText>
          {SUPPORT_SECTIONS.map((section) => (
            <Column key={section.title} spacing={theme.spacing.scale.sm}>
              <NativeText variant="titleMd" colorRole="strong">
                {section.title}
              </NativeText>
              {section.items.map((item) => (
                <Column
                  key={item.q}
                  spacing={theme.spacing.scale.xs}
                  style={{
                    padding: theme.spacing.scale.md,
                    borderRadius: theme.radius.component.card,
                    borderWidth: theme.border.width.default,
                    borderColor: theme.colors.border.subtle,
                    backgroundColor: theme.colors.surface.default,
                  }}
                >
                  <NativeText variant="bodyMd" colorRole="strong">
                    {item.q}
                  </NativeText>
                  <NativeText variant="bodySm" colorRole="muted">
                    {item.a}
                  </NativeText>
                </Column>
              ))}
            </Column>
          ))}
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
