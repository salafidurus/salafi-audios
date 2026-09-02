import { Column, ScrollView } from "@expo/ui";
import {
  getLegalDocument,
  type LegalBlock,
  type LegalDocument,
  type LegalLocale,
} from "@sd/domain-legal";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUnistyles } from "react-native-unistyles";

import { i18n } from "@/core/i18n/i18n";
import { RootScreenHeader } from "@/features/navigation";
import { NativeScreenHost, NativeText } from "@/shared/ui";

/** Configures the document identity and navigation callbacks for a legal detail screen. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the fields are documented by the exported contract and callback names.
export type LegalToggleScreenProps = {
  documentId: LegalDocument["id"];
  onNavigateToSupport?: () => void;
  onBack?: () => void;
};

/** Renders one shared legal document with native layout and locale-aware typography. */
export function LegalToggleScreen({
  documentId,
  onNavigateToSupport,
  onBack,
}: LegalToggleScreenProps) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const document = getLegalDocument(documentId);
  const locale: LegalLocale = i18n.language.startsWith("ar") ? "ar" : "en";

  if (!document) return null;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: theme.spacing.layout.pageX,
        }}
      >
        <RootScreenHeader title={document.title[locale]} showSearch={false} onBack={onBack} />
      </View>
      <NativeScreenHost testID={`legal-${documentId}-screen-host`}>
        <ScrollView showsIndicators={false}>
          <Column
            spacing={theme.spacing.scale.lg}
            style={{
              paddingHorizontal: theme.spacing.layout.pageX,
              paddingVertical: theme.spacing.layout.pageY,
              paddingBottom: theme.spacing.layout.pageY + insets.bottom + 96,
            }}
          >
            <NativeText variant="caption" colorRole="muted">
              {t("legal.lastUpdated", "Last updated")}: {document.updatedAt}
            </NativeText>
            {document.intro[locale].map((paragraph) => (
              <NativeText key={paragraph} variant="bodyMd" colorRole="subtle">
                {paragraph}
              </NativeText>
            ))}
            {document.sections.map((section) => (
              <Column key={section.id} spacing={theme.spacing.scale.sm}>
                <NativeText variant="titleMd" colorRole="strong">
                  {section.heading[locale]}
                </NativeText>
                {section.blocks[locale].map((block, index) => (
                  <LegalBlockView
                    key={`${section.id}-${block.type}-${index}`}
                    block={block}
                    onNavigateToSupport={onNavigateToSupport}
                  />
                ))}
              </Column>
            ))}
          </Column>
        </ScrollView>
      </NativeScreenHost>
    </View>
  );
}

function LegalBlockView({
  block,
  onNavigateToSupport,
}: {
  block: LegalBlock;
  onNavigateToSupport?: () => void;
}) {
  const { theme } = useUnistyles();

  if (block.type === "subheading") {
    return <NativeText variant="titleMd">{block.text}</NativeText>;
  }
  if (block.type === "paragraph") {
    return (
      <NativeText variant="bodyMd" colorRole="subtle">
        {block.text}
      </NativeText>
    );
  }
  if (block.type === "bullets") {
    return (
      <Column spacing={theme.spacing.scale.xs}>
        {block.items.map((item) => (
          <NativeText key={item} variant="bodyMd" colorRole="subtle">
            • {item}
          </NativeText>
        ))}
      </Column>
    );
  }
  if (block.type === "definitions") {
    return (
      <Column spacing={theme.spacing.scale.xs}>
        {block.items.map((item) => (
          <NativeText key={item.term} variant="bodyMd" colorRole="subtle">
            {item.term}: {item.definition}
          </NativeText>
        ))}
      </Column>
    );
  }
  if (block.href.kind === "internal") {
    return (
      <Pressable accessibilityRole="button" onPress={onNavigateToSupport}>
        <NativeText variant="bodyMd" colorRole="primary">
          {block.text}
        </NativeText>
      </Pressable>
    );
  }
  return (
    <NativeText variant="bodyMd" colorRole="primary">
      {block.text}
    </NativeText>
  );
}
