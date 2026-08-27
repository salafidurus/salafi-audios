"use client";

import type { ReactNode } from "react";

import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";

import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import styles from "./AdaptiveDataView.module.css";

export type AdaptiveDataViewState = "loading" | "error" | "empty";
export type AdaptiveDataViewSortDirection = "ascending" | "descending";

export interface AdaptiveDataViewColumn<TData> {
  key: string;
  header: string;
  priority?: "primary" | "secondary";
  sortable?: boolean;
  render?: (row: TData) => ReactNode;
}

export interface AdaptiveDataViewProps<TData extends object> {
  ariaLabel: string;
  columns: AdaptiveDataViewColumn<TData>[];
  data: TData[];
  getRowKey: (row: TData) => string;
  state?: AdaptiveDataViewState;
  sort?: { key: string; direction: AdaptiveDataViewSortDirection };
  onSort?: (key: string) => void;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
}

function renderSortIcon(
  columnKey: string,
  sort?: { key: string; direction: AdaptiveDataViewSortDirection },
) {
  if (sort?.key !== columnKey) return <ArrowUpDown data-icon="inline-end" aria-hidden="true" />;
  return sort.direction === "ascending" ? (
    <ArrowUp data-icon="inline-end" aria-hidden="true" />
  ) : (
    <ArrowDown data-icon="inline-end" aria-hidden="true" />
  );
}

function renderHeaderCell<TData extends object>(
  column: AdaptiveDataViewColumn<TData>,
  sort: AdaptiveDataViewProps<TData>["sort"],
  onSort: AdaptiveDataViewProps<TData>["onSort"],
) {
  if (!column.sortable || !onSort) return column.header;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={styles.sortButton}
      onClick={() => onSort(column.key)}
      aria-label={`Sort by ${column.header}`}
      aria-sort={sort?.key === column.key ? sort.direction : "none"}
    >
      {column.header}
      {renderSortIcon(column.key, sort)}
    </Button>
  );
}

export function AdaptiveDataView<TData extends object>({
  ariaLabel,
  columns,
  data,
  getRowKey,
  state,
  sort,
  onSort,
  loadingMessage = "Loading",
  emptyMessage = "No results",
  errorMessage = "Unable to load results",
}: AdaptiveDataViewProps<TData>) {
  if (state === "loading") {
    return (
      <div className={styles.feedback} role="status" aria-label={loadingMessage}>
        <Skeleton className="size-4" aria-hidden="true" />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <Alert variant="destructive" aria-label={errorMessage}>
        <AlertCircle aria-hidden="true" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Empty className={styles.feedback} role="status" aria-label={emptyMessage}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden="true" />
          </EmptyMedia>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={styles.container}>
      <Table className={styles.table} aria-label={ariaLabel}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                data-priority={column.priority ?? "primary"}
                aria-sort={sort?.key === column.key ? sort.direction : undefined}
              >
                {renderHeaderCell(column, sort, onSort)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  data-label={column.header}
                  data-priority={column.priority ?? "primary"}
                >
                  {column.render
                    ? column.render(row)
                    : // SAFETY: column keys are supplied by the view owner and map to row fields.
                      String(row[column.key as keyof TData] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
