import { useState, type ReactNode } from "react";
import { Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { RootScreenHeader } from "@/features/navigation";
import { NativeBridgeHost, NativeText } from "@/shared/ui";

/**
 * Defines the native Support navigation callbacks without coupling the feature to Expo Router.
 *
 * Callbacks are optional so the screen can be rendered in isolation for public help content;
 * when supplied, they own stack navigation and are invoked only from the corresponding action.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the public callback contract is documented above.
export type SupportScreenProps = {
  /** Returns to the previous screen. */
  onBack?: () => void;
  /** Opens the shared Terms and Conditions destination. */
  onNavigateToTerms?: () => void;
  /** Opens the shared Privacy Policy destination. */
  onNavigateToPrivacy?: () => void;
};

const FAQ_KEYS = ["whatIs", "saveLectures", "offline", "followScholar"] as const;

/** Mirrors the web Support information architecture with a native form, FAQ, and contact card. */
export function SupportScreen({
  onBack,
  onNavigateToTerms,
  onNavigateToPrivacy,
}: SupportScreenProps = {}) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: theme.recipes.mixedHeroSurface.backgroundColor }}>
      <View style={{ paddingTop: insets.top, paddingHorizontal: theme.spacing.layout.pageX }}>
        <RootScreenHeader title={t("support.title")} showSearch={false} onBack={onBack} />
      </View>
      <NativeBridgeHost testID="support-screen-host" matchContents={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInset={{
            bottom: theme.spacing.layout.pageY + insets.bottom + theme.spacing.scale["4xl"],
          }}
          contentContainerStyle={{
            gap: theme.spacing.layout.sectionY,
            padding: theme.spacing.layout.pageX,
          }}
        >
          <SupportForm />
          <SupportFaq openFaq={openFaq} setOpenFaq={setOpenFaq} />
          <SupportContact
            onNavigateToTerms={onNavigateToTerms}
            onNavigateToPrivacy={onNavigateToPrivacy}
          />
        </ScrollView>
      </NativeBridgeHost>
    </View>
  );
}

function SupportForm() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <SupportCard testID="support-form-card">
      <SectionHeading
        eyebrow={t("support.formEyebrow")}
        title={t("support.formSection")}
        description={t("support.formDescription")}
      />
      <FormField label={t("support.form.name")} />
      <FormField label={t("support.form.email")} keyboardType="email-address" />
      <NativeText variant="labelMd" colorRole="strong">
        {t("support.form.category")}
      </NativeText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.scale.sm }}>
        {(["technical", "content", "account", "other"] as const).map((category) => (
          <View
            key={category}
            style={{
              paddingHorizontal: theme.spacing.scale.md,
              paddingVertical: theme.spacing.scale.sm,
              borderRadius: theme.radius.component.chip,
              borderWidth: theme.border.width.default,
              borderColor: theme.colors.border.default,
            }}
          >
            <NativeText variant="bodySm">{t(`support.form.${category}`)}</NativeText>
          </View>
        ))}
      </View>
      <FormField label={t("support.form.subject")} />
      <FormField label={t("support.form.message")} multiline hint={t("support.form.messageHint")} />
      <Pressable
        disabled
        style={{
          minHeight: theme.spacing.scale["4xl"],
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius.component.chip,
          backgroundColor: theme.colors.action.primary,
          opacity: 0.5,
        }}
      >
        <NativeText colorRole="onAction" variant="labelMd">
          {t("support.form.submit")}
        </NativeText>
      </Pressable>
      <NativeText variant="bodySm" colorRole="muted">
        {t("support.form.comingSoon")}
      </NativeText>
    </SupportCard>
  );
}

function FormField({
  label,
  multiline = false,
  hint,
  keyboardType,
}: {
  label: string;
  multiline?: boolean;
  hint?: string;
  keyboardType?: "email-address";
}) {
  const { theme } = useUnistyles();
  return (
    <View style={{ gap: theme.spacing.scale.xs }}>
      <NativeText variant="labelMd" colorRole="strong">
        {label}
      </NativeText>
      <TextInput
        accessibilityLabel={label}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          minHeight: multiline
            ? theme.spacing.scale["3xl"] * 3
            : theme.spacing.scale["4xl"] + theme.spacing.scale.xs,
          paddingHorizontal: theme.spacing.scale.md,
          paddingVertical: theme.spacing.scale.sm,
          borderRadius: theme.radius.component.chip,
          borderWidth: theme.border.width.default,
          borderColor: theme.colors.border.default,
          backgroundColor: theme.colors.surface.default,
          color: theme.colors.content.strong,
          textAlign: theme.direction === "rtl" ? "right" : "left",
        }}
      />
      {hint ? (
        <NativeText variant="bodySm" colorRole="muted">
          {hint}
        </NativeText>
      ) : null}
    </View>
  );
}

function SupportFaq({
  openFaq,
  setOpenFaq,
}: {
  openFaq: string | null;
  setOpenFaq: (value: string | null) => void;
}) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <SupportCard testID="support-faq-card">
      <SectionHeading
        eyebrow={t("support.faqEyebrow")}
        title={t("support.faqSection")}
        description={t("support.faqDescription")}
      />
      {FAQ_KEYS.map((key) => {
        const isOpen = openFaq === key;
        return (
          <View
            key={key}
            style={{
              borderTopWidth: theme.border.width.default,
              borderTopColor: theme.colors.border.subtle,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpenFaq(isOpen ? null : key)}
              style={{
                minHeight: theme.spacing.scale["4xl"] + theme.spacing.scale.sm,
                justifyContent: "center",
              }}
            >
              <NativeText variant="bodyMd" colorRole="strong">
                {t(`support.faq.${key}.q`)}
              </NativeText>
            </Pressable>
            {isOpen ? (
              <NativeText
                variant="bodySm"
                colorRole="muted"
                style={{ paddingBottom: theme.spacing.scale.md }}
              >
                {t(`support.faq.${key}.a`)}
              </NativeText>
            ) : null}
          </View>
        );
      })}
    </SupportCard>
  );
}

function SupportContact({
  onNavigateToTerms,
  onNavigateToPrivacy,
}: Pick<SupportScreenProps, "onNavigateToTerms" | "onNavigateToPrivacy">) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <SupportCard testID="support-contact-card">
      <SectionHeading eyebrow={t("support.contactEyebrow")} title={t("support.contactSection")} />
      <NativeText variant="bodyMd" colorRole="subtle">
        {t("support.contactCopy")}
      </NativeText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t("support.contact.email.a")}
        onPress={() => void Linking.openURL("mailto:support@salafidurus.com")}
      >
        <NativeText variant="bodyMd" colorRole="primary">
          {t("support.contact.email.a")}
        </NativeText>
      </Pressable>
      <NativeText variant="bodySm" colorRole="muted">
        {t("support.legalPrompt")}
      </NativeText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.scale.lg }}>
        <Pressable accessibilityRole="link" onPress={onNavigateToPrivacy}>
          <NativeText colorRole="primary">{t("common.privacyPolicy")}</NativeText>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={onNavigateToTerms}>
          <NativeText colorRole="primary">{t("common.termsOfService")}</NativeText>
        </Pressable>
      </View>
    </SupportCard>
  );
}

function SupportCard({ children, testID }: { children: ReactNode; testID: string }) {
  const { theme } = useUnistyles();
  return (
    <View
      testID={testID}
      style={{
        gap: theme.spacing.component.gapMd,
        padding: theme.spacing.component.cardPadding,
        borderRadius: theme.radius.component.card,
        borderWidth: theme.border.width.default,
        borderColor: theme.colors.border.subtle,
        backgroundColor: theme.colors.surface.default,
      }}
    >
      {children}
    </View>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  const { theme } = useUnistyles();
  return (
    <View style={{ gap: theme.spacing.scale.xs }}>
      <NativeText variant="labelMd" colorRole="primary">
        {eyebrow}
      </NativeText>
      <NativeText variant="titleMd" colorRole="strong">
        {title}
      </NativeText>
      {description ? (
        <NativeText variant="bodySm" colorRole="muted">
          {description}
        </NativeText>
      ) : null}
    </View>
  );
}
