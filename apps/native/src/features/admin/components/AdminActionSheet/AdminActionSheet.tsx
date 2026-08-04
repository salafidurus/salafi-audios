import { BottomSheet, Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import {
  NativeButton,
  type NativeButtonVariant,
  type NativeIconName,
  NativeText,
} from "@/shared/ui";

type Action = {
  label: string;
  icon: NativeIconName;
  onPress: () => void;
  variant?: NativeButtonVariant;
};

export function AdminActionSheet({
  isOpen,
  title,
  onClose,
  actions,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  actions: Action[];
}) {
  const { theme } = useUnistyles();
  if (!isOpen) return null;

  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={onClose}
      snapPoints={["half"]}
      testID="admin-row-actions"
    >
      <Column
        spacing={theme.spacing.component.gapMd}
        style={{ padding: theme.spacing.component.panelPadding }}
      >
        <NativeText variant="titleMd" colorRole="strong">
          {title}
        </NativeText>
        {actions.map((action) => (
          <NativeButton
            key={action.label}
            label={action.label}
            icon={action.icon}
            variant={action.variant ?? "surface"}
            onPress={action.onPress}
          />
        ))}
        <NativeButton label="Cancel" variant="ghost" onPress={onClose} />
      </Column>
    </BottomSheet>
  );
}
