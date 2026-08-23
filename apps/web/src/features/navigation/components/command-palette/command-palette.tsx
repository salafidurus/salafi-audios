"use client";

import { routes } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { useInfiniteScholarsList } from "@sd/domain-content";
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
  const { data: scholarPages, isLoading: isScholarsLoading } = useInfiniteScholarsList({
    enabled: isOpen,
  });

  const results = useMemo<PaletteResult[]>(() => {
    if (!normalizedQuery) return [];

    const topicResults = topics.reduce<PaletteResult[]>((matches, topic) => {
      const label = getLocalizedName(topic.name, i18n.language);
      if (includesQuery(label, normalizedQuery)) {
        matches.push({
          id: `topic-${topic.id}`,
          label,
          type: "topic",
          href: `${routes.search}?topic=${encodeURIComponent(topic.slug)}`,
        });
      }
      return matches;
    }, []);

    const scholarResults = (scholarPages?.pages.flatMap((page) => page.items) ?? []).reduce<
      PaletteResult[]
    >((matches, scholar) => {
      if (includesQuery(scholar.name, normalizedQuery)) {
        matches.push({
          id: `scholar-${scholar.id}`,
          label: scholar.name,
          type: "scholar",
          href: routes.scholars.detail(scholar.slug),
          metadata: t("navigation.searchCatalogScholarMetadata", "{{count}} listings", {
            count: scholar.lectureCount,
          }),
        });
      }
      return matches;
    }, []);

    const listings = [
      ...(listingData?.collections ?? []),
      ...(listingData?.series ?? []),
      ...(listingData?.singles ?? []),
    ];
    const listingResults = listings.reduce<PaletteResult[]>((matches, listing) => {
      if (
        includesQuery(listing.title, normalizedQuery) ||
        includesQuery(listing.scholarName, normalizedQuery)
      ) {
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

    return [...topicResults, ...scholarResults, ...listingResults];
  }, [i18n.language, listingData, normalizedQuery, scholarPages, t, topics]);

  const isLoading =
    isOpen &&
    normalizedQuery.length > 0 &&
    (isListingsLoading || isTopicsLoading || isScholarsLoading);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  const searchLabel = t("navigation.searchCatalog", "Search catalog");
  const activeResult = activeIndex >= 0 ? results[activeIndex] : undefined;

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
              onKeyDown={handleKeyDown}
            />
          </div>
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
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateToResult(result)}
                >
                  <span className={styles.resultBody}>
                    <span className={styles.resultLabel}>{result.label}</span>
                    {result.metadata && (
                      <span className={styles.resultMetadata}>{result.metadata}</span>
                    )}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
