import type { ErrorBoundaryProps } from "expo-router";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { SearchHomeMobileNativeScreen } from "../../../../features/search/screens/search-home/search-home.screen";
import { routes } from "@sd/core-contracts";

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

export default function SearchIndex() {
  const router = useRouter();

  return (
    <SearchHomeMobileNativeScreen
      onOpenSearch={() => router.push(routes.search)}
      onSelectCategory={(searchKey) =>
        router.push(`${routes.search}?searchKey=${encodeURIComponent(searchKey)}`)
      }
    />
  );
}
