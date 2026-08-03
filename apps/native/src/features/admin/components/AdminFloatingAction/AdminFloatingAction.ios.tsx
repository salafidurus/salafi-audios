import { Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { NativeButton } from "@/shared/ui";

type AdminFloatingActionProps = {
  children: React.ReactNode;
  isVisible: boolean;
  onPress: () => void;
};
export function AdminFloatingAction({ children, isVisible, onPress }: AdminFloatingActionProps) {
  const { theme } = useUnistyles();
  return (
    <Column spacing={theme.spacing.component.gapLg}>
      {children}
      {isVisible ? (
        <NativeButton
          label="Add Listing"
          icon="add"
          onPress={onPress}
          testID="admin-listings-add-fab"
        />
      ) : null}
    </Column>
  );
}
