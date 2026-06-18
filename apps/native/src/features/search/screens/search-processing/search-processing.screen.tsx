import { useEffect, useRef } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import {
  SearchInput,
  type SearchInputRef,
} from "@/features/search/components/SearchInput/SearchInput";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import {
  SearchResultsList,
  type SearchResultRow,
} from "@/features/search/components/SearchResultsList/SearchResultsList";
import { useSearchProcessing } from "@sd/domain-search";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type SearchProcessingScreenProps = {
  prefill?: string;
  onBackPress?: () => void;
};

export function SearchProcessingScreen({ prefill, onBackPress }: SearchProcessingScreenProps) {
  const inputRef = useRef<SearchInputRef>(null);
  const showOriginal = useShowOriginalContent();
  const {
    query,
    setQuery,
    filter,
    setFilter,
    topics,
    items,
    isFetching,
    shouldSearch,
    errorMessage,
  } = useSearchProcessing({ prefill, showOriginal });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ScreenView backgroundVariant="primaryWash">
      <View style={styles.searchGroup}>
        <SearchInput
          ref={inputRef}
          placeholder="Search"
          value={query}
          onChange={setQuery}
          onBackPress={onBackPress}
        />
        {shouldSearch ? <SearchFilter value={filter} onChange={setFilter} topics={topics} /> : null}
      </View>
      <SearchResultsList
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        renderItem={(item: SearchResultRow) => (
          <SearchResultItem
            title={item.title}
            scholarName={item.scholarName}
            imageUrl={item.imageUrl}
            lectureCount={item.lectureCount}
            durationSeconds={item.durationSeconds}
          />
        )}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchGroup: {
    gap: theme.spacing.component.gapSm,
  },
}));
