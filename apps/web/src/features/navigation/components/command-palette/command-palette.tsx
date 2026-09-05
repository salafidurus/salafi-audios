/** Documents this module's responsibility and public boundary. */
"use client";

import { routes } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { useScholarSearch } from "@sd/domain-content";
import { useSearchCatalog, useTopicsList } from "@sd/domain-search";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { formatDuration } from "@/shared/utils/format";

import styles from "./command-palette.module.css";

type PaletteResult = {
  id: string;
  label: string;
  type: "topic" | "scholar" | "listing";
  href: string;
  metadata?: string;
};

function includesQuery(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

type PaletteTopics = NonNullable<ReturnType<typeof useTopicsList>["data"]>;
type PaletteScholarData = NonNullable<ReturnType<typeof useScholarSearch>["data"]>;
type PaletteListingData = NonNullable<ReturnType<typeof useSearchCatalog>["data"]>;

function buildTopicResults(
  query: string,
  topics: PaletteTopics,
  language: string,
): PaletteResult[] {
  return topics.reduce<PaletteResult[]>((matches, topic) => {
    const label = getLocalizedName(topic.name, language);
    if (includesQuery(label, query)) {
      matches.push({
        id: `topic-${topic.id}`,
        label,
        type: "topic",
        href: `${routes.search}?topic=${encodeURIComponent(topic.slug)}`,
      });
    }
    return matches;
  }, []);
}

function buildScholarResults(
  data: PaletteScholarData | undefined,
  t: ReturnType<typeof useTranslation>["t"],
): PaletteResult[] {
  return (data?.scholars ?? []).reduce<PaletteResult[]>((matches, scholar) => {
    matches.push({
      id: `scholar-${scholar.id}`,
      label: scholar.name,
      type: "scholar",
      href: routes.scholars.detail(scholar.slug),
      metadata: t("navigation.searchCatalogScholarMetadata", "{{count}} listings", {
        count: scholar.lectureCount,
      }),
    });
    return matches;
  }, []);
}

function buildListingResults(query: string, data: PaletteListingData | undefined): PaletteResult[] {
  const listings = [
    ...(data?.collections ?? []),
    ...(data?.series ?? []),
    ...(data?.singles ?? []),
  ];
  return listings.reduce<PaletteResult[]>((matches, listing) => {
    if (includesQuery(listing.title, query) || includesQuery(listing.scholarName, query)) {
      matches.push({
        id: `listing-${listing.id}`,
        label: listing.title,
        type: "listing",
        href: routes.listings.detail(listing.slug),
        metadata: formatDuration(listing.durationSeconds),
      });
    }
    return matches;
  }, []);
}

function buildPaletteResults(
  normalizedQuery: string,
  topics: PaletteTopics,
  scholarData: PaletteScholarData | undefined,
  listingData: PaletteListingData | undefined,
  language: string,
  t: ReturnType<typeof useTranslation>["t"],
): PaletteResult[] {
  if (!normalizedQuery) return [];

  return [
    ...buildTopicResults(normalizedQuery, topics, language),
    ...buildScholarResults(scholarData, t),
    ...buildListingResults(normalizedQuery, listingData),
  ];
}

function handlePaletteKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  results: PaletteResult[],
  activeIndex: number,
  setActiveIndex: (value: number | ((index: number) => number)) => void,
  navigateToResult: (result: PaletteResult) => void,
) {
  if (event.nativeEvent.isComposing) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveIndex((index) => (results.length ? (index + 1) % results.length : -1));
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveIndex((index) =>
      results.length ? (index - 1 + results.length) % results.length : -1,
    );
  } else if (event.key === "Enter" && activeIndex >= 0) {
    event.preventDefault();
    const result = results[activeIndex];
    if (result) navigateToResult(result);
  }
}

function PaletteResultsView({
  isLoading,
  normalizedQuery,
  results,
  activeIndex,
  onHover,
  onSelect,
  t,
}: {
  isLoading: boolean;
  normalizedQuery: string;
  results: PaletteResult[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (result: PaletteResult) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div id="command-palette-results" role="listbox" className={styles.results}>
      {isLoading ? (
        <p role="status" className={styles.message}>
          {t("navigation.searchCatalogLoading", "Loading catalog")}
        </p>
      ) : normalizedQuery && results.length === 0 ? (
        <p role="status" className={styles.message}>
          {t("navigation.searchCatalogEmpty", "No catalog results")}
        </p>
      ) : !normalizedQuery ? (
        <p className={styles.message}>
          {t("navigation.searchCatalogHint", "Type to search public catalog content")}
        </p>
      ) : (
        results.map((result, index) => (
          <button
            key={result.id}
            id={`command-result-${result.id}`}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            className={styles.result}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(result)}
          >
            <span className={styles.resultBody}>
              <span className={styles.resultLabel}>{result.label}</span>
              {result.metadata && <span className={styles.resultMetadata}>{result.metadata}</span>}
            </span>
            <span className={styles.resultType}>
              {t(
                `navigation.searchCatalogType.${result.type}`,
                result.type.charAt(0).toUpperCase() + result.type.slice(1),
              )}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

function getPaletteLoadingState(
  isOpen: boolean,
  query: string,
  isListingsLoading: boolean,
  isTopicsLoading: boolean,
  isScholarsLoading: boolean,
) {
  return isOpen && query.length > 0 && (isListingsLoading || isTopicsLoading || isScholarsLoading);
}

function getActivePaletteResult(results: PaletteResult[], activeIndex: number) {
  return activeIndex >= 0 ? results[activeIndex] : undefined;
}

/** Provides the globally available catalog, topic, and scholar search surface. */
export function CommandPalette() {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim();

  const { data: listingData, isLoading: isListingsLoading } = useSearchCatalog(
    { q: normalizedQuery, limit: 8 },
    { enabled: isOpen && normalizedQuery.length > 0 },
  );
  const { data: topics = [], isLoading: isTopicsLoading } = useTopicsList({ enabled: isOpen });
  const { data: scholarData, isLoading: isScholarsLoading } = useScholarSearch(normalizedQuery, {
    enabled: isOpen && normalizedQuery.length > 0,
  });

  const results = useMemo<PaletteResult[]>(() => {
    return buildPaletteResults(normalizedQuery, topics, scholarData, listingData, i18n.language, t);
  }, [i18n.language, listingData, normalizedQuery, scholarData, t, topics]);

  const isLoading = getPaletteLoadingState(
    isOpen,
    normalizedQuery,
    isListingsLoading,
    isTopicsLoading,
    isScholarsLoading,
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };

  const navigateToResult = (result: PaletteResult) => {
    close();
    router.push(result.href);
  };

  const searchLabel = t("navigation.searchCatalog", "Search catalog");
  const activeResult = getActivePaletteResult(results, activeIndex);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={styles.trigger}
        aria-label={searchLabel}
        onClick={() => setIsOpen(true)}
      >
        <Search aria-hidden="true" size={16} />
        <span>{searchLabel}</span>
        <kbd aria-hidden="true">⌘K</kbd>
      </Button>
      <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : close())}>
        <DialogContent
          className={styles.dialog}
          dir={i18n.dir()}
          aria-describedby="command-palette-description"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>{searchLabel}</DialogTitle>
            <DialogDescription id="command-palette-description">
              {t("navigation.searchCatalogDescription", "Find topics, scholars, and listings.")}
            </DialogDescription>
          </DialogHeader>
          <div className={styles.inputWrapper}>
            <Search aria-hidden="true" size={16} />
            <input
              ref={inputRef}
              role="combobox"
              aria-label={searchLabel}
              aria-autocomplete="list"
              aria-controls="command-palette-results"
              aria-expanded="true"
              aria-activedescendant={activeResult ? `command-result-${activeResult.id}` : undefined}
              className={styles.input}
              placeholder={t(
                "navigation.searchCatalogPlaceholder",
                "Search topics, scholars, or listings",
              )}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={(event) =>
                handlePaletteKeyDown(event, results, activeIndex, setActiveIndex, navigateToResult)
              }
            />
          </div>
          <PaletteResultsView
            isLoading={isLoading}
            normalizedQuery={normalizedQuery}
            results={results}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onSelect={navigateToResult}
            t={t}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
