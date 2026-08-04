import type { ScholarChipDto } from "@sd/core-contracts";

import { Column, Row, ScrollView } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { NativeButton, NativeText } from "@/shared/ui";

export type ExploreScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function ExploreScholarRow({ scholars, onScholarPress }: ExploreScholarRowProps) {
  const { theme } = useUnistyles();

  return (
    <Column spacing={theme.spacing.scale.sm}>
      <NativeText variant="titleMd" colorRole="strong">
        Popular Scholars
      </NativeText>
      <ScrollView showsIndicators={false}>
        <Row spacing={theme.spacing.scale.md}>
          {scholars.map((scholar) => (
            <NativeButton
              key={scholar.id}
              label={scholar.name}
              variant="ghost"
              size="sm"
              onPress={() => onScholarPress?.(scholar.slug)}
              testID={`scholar-chip-${scholar.slug}`}
            />
          ))}
        </Row>
      </ScrollView>
    </Column>
  );
}
