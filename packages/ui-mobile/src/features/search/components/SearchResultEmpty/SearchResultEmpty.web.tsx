import { Text, View, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export type SearchResultEmptyProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  errorMessage?: string;
};

export function SearchResultEmpty({
  shouldSearch,
  isFetching,
  errorMessage,
}: SearchResultEmptyProps) {
  const { theme } = useUnistyles();

  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? "Searching..."
        : "No results found."
    : "Start typing to search.";

  return (
    <View
      style={
        {
          marginTop: theme.spacing.scale["3xl"],
          alignItems: "center",
        } as unknown as ViewStyle
      }
    >
      <Text
        style={[
          theme.typography.bodyMd as any,
          { color: theme.colors.content.muted, textAlign: "center" },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}
