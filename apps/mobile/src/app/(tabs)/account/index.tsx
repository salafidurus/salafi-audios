import type { ErrorBoundaryProps } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { AccountMobileNativeScreen } from "../../../features/account/screens/account.screen";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Something went wrong</Text>
      <Pressable onPress={retry}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function AccountIndex() {
  return <AccountMobileNativeScreen />;
}
