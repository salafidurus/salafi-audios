import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SearchInput, type SearchInputRef } from "../components/SearchInput";
import { ScreenView } from "@/shared/components/ScreenView";

export type SearchProcessingProps = {
  prefill?: string;
};

export function SearchProcessing({ prefill }: SearchProcessingProps) {
  const [query, setQuery] = useState(prefill || "");
  const inputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ScreenView>
      <SearchInput ref={inputRef} placeholder="Search" value={query} onChange={setQuery} />
      <View style={styles.resultsContainer} />
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  resultsContainer: {
    flex: 1,
    marginTop: theme.spacing.component.gapLg,
  },
}));
