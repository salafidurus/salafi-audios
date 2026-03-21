import { useEffect, useRef } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  SearchFilterMobileNative,
} from "../../components/SearchFilter/SearchFilter.native";
import {
  SearchInput,
  type SearchInputRef,
} from "../../components/SearchInput/SearchInput.native";
import { SearchResultItemMobileNative } from "../../components/SearchResultItem/SearchResultItem.native";
import {
  SearchResultsListMobileNative,
  type SearchResultRow,
} from "../../components/SearchResultsList/SearchResultsList.native";
import { useSearchProcessing } from "../../hooks/use-search-processing";
import { ScreenViewMobileNative } from "@sd/shared";

export type SearchProcessingScreenProps = {
  prefill?: string;
  onBackPress?: () => void;
};

export function SearchProcessingMobileNativeScreen({
  prefill,
  onBackPress,
}: SearchProcessingScreenProps) {
  const inputRef = useRef<SearchInputRef>(null);
  const { query, setQuery, filter, setFilter, topics, items, isFetching, shouldSearch, errorMessage } =
    useSearchProcessing({ prefill });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ScreenViewMobileNative backgroundVariant="primaryWash">
      <View style={styles.searchGroup}>
        <SearchInput
          ref={inputRef}
          placeholder="Search"
          value={query}
          onChange={setQuery}
          onBackPress={onBackPress}
        />
        {shouldSearch ? (
          <SearchFilterMobileNative value={filter} onChange={setFilter} topics={topics} />
        ) : null}
      </View>
      <SearchResultsListMobileNative
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        renderItem={(item: SearchResultRow) => (
          <SearchResultItemMobileNative
            title={item.title}
            scholarName={item.scholarName}
            imageUrl={item.imageUrl}
            lectureCount={item.lectureCount}
            durationSeconds={item.durationSeconds}
          />
        )}
      />
    </ScreenViewMobileNative>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchGroup: {
    gap: theme.spacing.component.gapSm,
  },
}));
