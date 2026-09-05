/** Documents this module's responsibility and public boundary. */
"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { InputField } from "@/shared/components/ui/input-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import type { PromotionListingOption } from "./PromotionsHeroSection";

import styles from "./promotions-content.module.css";

type SortKey = "title" | "scholarName";
type Direction = "asc" | "desc";
function SortIcon({ active, direction }: { active: boolean; direction: Direction }) {
  if (!active) return <ArrowUpDown aria-hidden="true" size={14} />;
  return direction === "asc" ? (
    <ArrowUp aria-hidden="true" size={14} />
  ) : (
    <ArrowDown aria-hidden="true" size={14} />
  );
}

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSearchId: string;
  onSelectedSearchIdChange: (value: string) => void;
  searchOptions: PromotionListingOption[];
  editorsPicks: PromotionListingOption[];
  onEditorsPicksChange: (value: PromotionListingOption[]) => void;
  /** Receives duplicate-selection feedback so the parent can show it beside Save. */
  onError: (message: string) => void;
};

/** Renders searchable, sortable editor-picked listings for homepage curation. */
export function EditorsPicksSection({
  search,
  onSearchChange,
  selectedSearchId,
  onSelectedSearchIdChange,
  searchOptions,
  editorsPicks,
  onEditorsPicksChange,
  onError,
}: Props) {
  const { t } = useTranslation();
  const [sort, setSort] = useState<{ key: SortKey; direction: Direction }>({
    key: "title",
    direction: "asc",
  });
  const sorted = [...editorsPicks].sort(
    (a, b) =>
      a[sort.key].localeCompare(b[sort.key], undefined, { sensitivity: "base" }) *
      (sort.direction === "asc" ? 1 : -1),
  );
  const addPick = () => {
    const match = searchOptions.find((option) => option.id === selectedSearchId);
    if (!match) return;
    if (editorsPicks.some((pick) => pick.id === match.id)) {
      onError(t("admin.promotions.alreadyAdded"));
      return;
    }
    onEditorsPicksChange([...editorsPicks, match]);
    onSearchChange("");
    onSelectedSearchIdChange("");
  };
  const sortBy = (key: SortKey) =>
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  const sortHead = (key: SortKey, label: string) => {
    const active = sort.key === key;
    return (
      <TableHead
        scope="col"
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      >
        <Button
          variant="ghost"
          size="sm"
          className={styles.sortButton}
          onClick={() => sortBy(key)}
          aria-label={t("admin.contents.sortBy", "Sort by {{label}}", { label })}
        >
          {label}
          <SortIcon active={active} direction={sort.direction} />
        </Button>
      </TableHead>
    );
  };
  const remove = (id: string) =>
    onEditorsPicksChange(editorsPicks.filter((pick) => pick.id !== id));
  return (
    <Card className={styles.section}>
      <CardHeader className={styles.sectionHeader}>
        <Star className={styles.sectionIcon} size={20} />
        <CardTitle>{t("admin.promotions.editorsPicksTitle", "Editors' Picks Curation")}</CardTitle>
      </CardHeader>
      <CardDescription className={styles.sectionDesc}>
        {t(
          "admin.promotions.editorsPicksDesc",
          "Manage the listings highlighted inside the Editors' Picks feed widget on the homepage.",
        )}
      </CardDescription>
      <CardContent className={styles.sectionContent}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="picks-search-input">
            {t("admin.promotions.addPickLabel", "Add Listing to Picks")}
          </label>
          <div className={styles.searchAddRow}>
            <InputField
              id="picks-search-input"
              value={search}
              onChange={(value) => {
                onSearchChange(value);
                onSelectedSearchIdChange("");
              }}
              placeholder={t(
                "admin.promotions.searchPlaceholder",
                "Search lectures by title or scholar...",
              )}
            />
            <Button
              variant="primary"
              onClick={addPick}
              disabled={!selectedSearchId}
              icon={<Plus size={16} />}
            >
              {t("common.add", "Add")}
            </Button>
          </div>
          {searchOptions.length > 0 && (
            <select
              id="picks-select-dropdown"
              aria-label={t("admin.promotions.selectMatch", "Select matching listing")}
              className={styles.select}
              value={selectedSearchId}
              onChange={(event) => onSelectedSearchIdChange(event.target.value)}
            >
              <option value="">
                -- {t("admin.promotions.selectMatch", "Select matching listing")} --
              </option>
              {searchOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} ({option.scholarName})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.picksTable}>
          {editorsPicks.length === 0 ? (
            <p className={styles.emptyPicks}>
              {t("admin.promotions.emptyPicks", "No Editors' Picks selected yet.")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">#</TableHead>
                  {sortHead("title", t("admin.promotions.listingColumn", "Listing"))}
                  {sortHead("scholarName", t("admin.promotions.scholarColumn", "Scholar"))}
                  <TableHead scope="col" className={styles.actionColumn}>
                    {t("admin.promotions.actionsColumn", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((pick, index) => (
                  <TableRow key={pick.id}>
                    <TableCell className={styles.pickIndex}>#{index + 1}</TableCell>
                    <TableCell className={styles.pickTitle}>{pick.title}</TableCell>
                    <TableCell className={styles.pickSub}>{pick.scholarName}</TableCell>
                    <TableCell className={styles.actionColumn}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.removeButton}
                        onClick={() => remove(pick.id)}
                        aria-label={t("admin.promotions.removePick", "Remove Pick")}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div className={styles.picksList}>
          {editorsPicks.length === 0 ? (
            <p className={styles.emptyPicks}>
              {t("admin.promotions.emptyPicks", "No Editors' Picks selected yet.")}
            </p>
          ) : (
            editorsPicks.map((pick, index) => (
              <div key={pick.id} className={styles.pickRow}>
                <span className={styles.pickIndex}>#{index + 1}</span>
                <div className={styles.pickDetails}>
                  <p className={styles.pickTitle}>{pick.title}</p>
                  <p className={styles.pickSub}>{pick.scholarName}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.removeButton}
                  onClick={() => remove(pick.id)}
                  aria-label={t("admin.promotions.removePick", "Remove Pick")}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
