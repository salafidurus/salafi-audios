import { Box, ExtendedFloatingActionButton } from "@expo/ui/jetpack-compose";
import { fillMaxSize, padding, testID } from "@expo/ui/jetpack-compose/modifiers";
import { useUnistyles } from "react-native-unistyles";

import { NativeIcon, NativeText } from "@/shared/ui";

type AdminFloatingActionProps = {
  children: React.ReactNode;
  isVisible: boolean;
  onPress: () => void;
};

export function AdminFloatingAction({ children, isVisible, onPress }: AdminFloatingActionProps) {
  const { theme } = useUnistyles();
  return (
    <Box
      contentAlignment="bottomEnd"
      modifiers={[
        fillMaxSize(),
        padding(0, 0, theme.spacing.layout.pageX, theme.spacing.layout.pageY),
      ]}
    >
      {children}
      {isVisible ? (
        <ExtendedFloatingActionButton
          onClick={onPress}
          modifiers={[testID("admin-listings-add-fab")]}
        >
          <ExtendedFloatingActionButton.Icon>
            <NativeIcon name="add" />
          </ExtendedFloatingActionButton.Icon>
          <ExtendedFloatingActionButton.Text>
            <NativeText variant="labelMd">Add Listing</NativeText>
          </ExtendedFloatingActionButton.Text>
        </ExtendedFloatingActionButton>
      ) : null}
    </Box>
  );
}
