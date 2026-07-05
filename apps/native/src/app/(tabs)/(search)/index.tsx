import { type Href, type ErrorBoundaryProps, useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { routes } from "@sd/core-contracts";
import { SearchHomeScreen } from "@/features/search/screens/search-home/search-home.screen";

export function ErrorBoundary({ error: _error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Something went wrong</Text>
      <Pressable onPress={retry}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function SearchIndexRoute() {
  const router = useRouter();

  return (
    <SearchHomeScreen
      onOpenSearch={() => router.push(routes.search as Href)}
      onSelectCategory={(key) =>
        router.push(`${routes.search}?searchKey=${encodeURIComponent(key)}` as Href)
      }
      onSelectScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
      onSelectSuggestion={(slug) =>
        router.push(`${routes.search}?searchKey=${encodeURIComponent(slug)}` as Href)
      }
      onContinueListening={(id) => router.push(routes.lectures.detail(id) as Href)}
    />
  );
}
