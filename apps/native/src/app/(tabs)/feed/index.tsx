import type { ErrorBoundaryProps, Href } from "expo-router";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { routes } from "@sd/core-contracts";
import { FeedScreen } from "@/features/feed/screens/feed.screen";

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

export default function FeedIndexRoute() {
  const router = useRouter();

  return (
    <FeedScreen
      onNavigateToLecture={(id) => router.push(routes.lectures.detail(id) as Href)}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
