/** Native support surface presenting FAQ and contact guidance. */
/** Renders native FAQ and support contact content. */
import { Column, ScrollView } from "@expo/ui";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUnistyles } from "react-native-unistyles";

import { RootScreenHeader } from "@/features/navigation";
import { NativeScreenHost, NativeText } from "@/shared/ui";

/** Owns the static FAQ and support contact content shown to native users. */
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

/** Presents static FAQ and contact entries inside the native support surface. */
export function SupportScreen({ onBack }: { onBack?: () => void } = {}) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: theme.spacing.layout.pageX,
        }}
      >
        <RootScreenHeader title="Support" showSearch={false} onBack={onBack} />
      </View>
      <NativeScreenHost testID="support-screen-host">
        <ScrollView showsIndicators={false}>
          <Column
            spacing={theme.spacing.scale.lg}
            style={{
              paddingHorizontal: theme.spacing.layout.pageX,
              paddingVertical: theme.spacing.layout.pageY,
              paddingBottom: theme.spacing.layout.pageY + insets.bottom + 96,
            }}
          >
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
    </View>
  );
}
