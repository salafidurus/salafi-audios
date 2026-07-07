"use client";

import React, { useReducer } from "react";
import Link from "next/link";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto, AdminListingListItemDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./admin-scholar-detail.screen.desktop.module.css";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminScholarDetailDesktopScreenProps {
  id: string;
}

type ScholarsListDto = { scholars: ScholarListItemDto[] };

type FormState = {
  newSeriesTitle: string;
  newSeriesOrder: number;
  creatingSeries: boolean;
  newCollectionTitle: string;
  newCollectionOrder: number;
  creatingCollection: boolean;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

const slugify = (text: string) => {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]/g, "")
      .replace(/-+/g, "-") || `listing-${Date.now()}`
  );
};

export function AdminScholarDetailDesktopScreen({ id }: AdminScholarDetailDesktopScreenProps) {
  // Fetch Scholar
  const { data: scholarsData } = useApiQuery<ScholarsListDto>(queryKeys.scholars.list(), () =>
    httpClient<ScholarsListDto>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const scholar = scholarsData?.scholars.find((s) => s.id === id);

  // Fetch all Listings for this scholar
  const { data: listingsData, refetch: refetchListings } = useApiQuery<AdminListingListItemDto[]>(
    ["admin-listings-scholar", id],
    () =>
      httpClient<AdminListingListItemDto[]>({
        url: `${endpoints.admin.listings.list}?scholarId=${id}`,
        method: "GET",
      }),
  );

  const [state, dispatch] = useReducer(reduce, {
    newSeriesTitle: "",
    newSeriesOrder: 0,
    creatingSeries: false,
    newCollectionTitle: "",
    newCollectionOrder: 0,
    creatingCollection: false,
  });

  const {
    newSeriesTitle,
    newSeriesOrder,
    creatingSeries,
    newCollectionTitle,
    newCollectionOrder,
    creatingCollection,
  } = state;

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeriesTitle.trim()) return;

    try {
      await httpClient({
        url: endpoints.admin.listings.create,
        method: "POST",
        body: {
          scholarId: id,
          title: newSeriesTitle,
          slug: slugify(newSeriesTitle),
          format: "series",
          language: scholar?.mainLanguage || "ar",
          orderIndex: Number(newSeriesOrder),
        },
      });
      dispatch({ newSeriesTitle: "", newSeriesOrder: 0, creatingSeries: false });
      refetchListings();
    } catch {
      // ignore
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    try {
      await httpClient({
        url: endpoints.admin.listings.create,
        method: "POST",
        body: {
          scholarId: id,
          title: newCollectionTitle,
          slug: slugify(newCollectionTitle),
          format: "collection",
          language: scholar?.mainLanguage || "ar",
          orderIndex: Number(newCollectionOrder),
        },
      });
      dispatch({ newCollectionTitle: "", newCollectionOrder: 0, creatingCollection: false });
      refetchListings();
    } catch {
      // ignore
    }
  };

  const handleUpdateOrder = async (listingId: string, orderIndex: number) => {
    try {
      await httpClient({
        url: endpoints.admin.listings.update(listingId),
        method: "PUT",
        body: { orderIndex },
      });
      refetchListings();
    } catch {
      // ignore
    }
  };

  const scholarSeries = listingsData?.filter((l) => l.format === "series") ?? [];
  const scholarCollections = listingsData?.filter((l) => l.format === "collection") ?? [];

  return (
    <ScreenView>
      <div className={styles.container}>
        <div className={styles.backNav}>
          <Link href="/admin/scholars" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Scholars
          </Link>
        </div>

        <div className={styles.header}>
          <div>
            <span className={styles.subtitle}>Manage Scholar Details</span>
            <h1 className={styles.title}>{scholar?.name || "Loading Scholar..."}</h1>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Series Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Series</h2>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => dispatch({ creatingSeries: !creatingSeries })}
              >
                <Plus size={16} /> Add Series
              </button>
            </div>

            {creatingSeries && (
              <form onSubmit={handleCreateSeries} className={styles.quickForm}>
                <input
                  type="text"
                  placeholder="Series Title"
                  className={styles.input}
                  value={newSeriesTitle}
                  onChange={(e) => dispatch({ newSeriesTitle: e.target.value })}
                  aria-label="Series title"
                  required
                />
                <input
                  type="number"
                  placeholder="Order"
                  className={styles.input}
                  value={newSeriesOrder}
                  onChange={(e) => dispatch({ newSeriesOrder: Number(e.target.value) })}
                  aria-label="Series order index"
                />
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => dispatch({ creatingSeries: false })}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.list}>
              {scholarSeries.map((s) => (
                <div key={s.id} className={styles.itemRow}>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemTitle}>{s.title}</span>
                    <span className={`${styles.badge} ${styles[`badge-${s.status}`]}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className={styles.itemOrdering}>
                    <input
                      type="number"
                      className={styles.orderInput}
                      defaultValue={s.orderIndex || 0}
                      onBlur={(e) => handleUpdateOrder(s.id, Number(e.target.value))}
                      aria-label="Update series order index"
                      title="Update Order Index"
                    />
                  </div>
                </div>
              ))}
              {scholarSeries.length === 0 && (
                <span className={styles.noData}>No series created for this scholar yet.</span>
              )}
            </div>
          </div>

          {/* Collections Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Collections</h2>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => dispatch({ creatingCollection: !creatingCollection })}
              >
                <Plus size={16} /> Add Collection
              </button>
            </div>

            {creatingCollection && (
              <form onSubmit={handleCreateCollection} className={styles.quickForm}>
                <input
                  type="text"
                  placeholder="Collection Title"
                  className={styles.input}
                  value={newCollectionTitle}
                  onChange={(e) => dispatch({ newCollectionTitle: e.target.value })}
                  aria-label="Collection title"
                  required
                />
                <input
                  type="number"
                  placeholder="Order"
                  className={styles.input}
                  value={newCollectionOrder}
                  onChange={(e) => dispatch({ newCollectionOrder: Number(e.target.value) })}
                  aria-label="Collection order index"
                />
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => dispatch({ creatingCollection: false })}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.list}>
              {scholarCollections.map((c) => (
                <div key={c.id} className={styles.itemRow}>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemTitle}>{c.title}</span>
                    <span className={`${styles.badge} ${styles[`badge-${c.status}`]}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className={styles.itemOrdering}>
                    <input
                      type="number"
                      className={styles.orderInput}
                      defaultValue={c.orderIndex || 0}
                      onBlur={(e) => handleUpdateOrder(c.id, Number(e.target.value))}
                      aria-label="Update collection order index"
                      title="Update Order Index"
                    />
                  </div>
                </div>
              ))}
              {scholarCollections.length === 0 && (
                <span className={styles.noData}>No collections created for this scholar yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScreenView>
  );
}
