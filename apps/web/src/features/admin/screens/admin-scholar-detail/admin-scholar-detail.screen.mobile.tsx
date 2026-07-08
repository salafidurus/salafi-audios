"use client";

import React from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto, AdminListingListItemDto } from "@sd/core-contracts";
import Link from "next/link";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Button } from "@/shared/components/Button";
import styles from "./admin-scholar-detail.screen.mobile.module.css";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminScholarDetailMobileScreenProps {
  id: string;
}

type ScholarsListDto = { scholars: ScholarListItemDto[] };

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

export function AdminScholarDetailMobileScreen({ id }: AdminScholarDetailMobileScreenProps) {
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

  type FormState = {
    activeTab: "series" | "collections";
    newSeriesTitle: string;
    creatingSeries: boolean;
    newCollectionTitle: string;
    creatingCollection: boolean;
  };

  const [formState, dispatchForm] = React.useReducer(
    (state: FormState, patch: Partial<FormState>): FormState => ({ ...state, ...patch }),
    {
      activeTab: "series",
      newSeriesTitle: "",
      creatingSeries: false,
      newCollectionTitle: "",
      creatingCollection: false,
    },
  );

  const { activeTab, newSeriesTitle, creatingSeries, newCollectionTitle, creatingCollection } =
    formState;

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
        },
      });
      dispatchForm({ newSeriesTitle: "", creatingSeries: false });
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
        },
      });
      dispatchForm({ newCollectionTitle: "", creatingCollection: false });
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
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className={styles.header}>
          <span className={styles.subtitle}>Manage Scholar</span>
          <h1 className={styles.title}>{scholar?.name || "Loading..."}</h1>
        </div>

        {/* Tab Buttons */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "series" ? styles.tabActive : ""}`}
            onClick={() => dispatchForm({ activeTab: "series" })}
          >
            Series ({scholarSeries.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "collections" ? styles.tabActive : ""}`}
            onClick={() => dispatchForm({ activeTab: "collections" })}
          >
            Collections ({scholarCollections.length})
          </button>
        </div>

        {activeTab === "series" ? (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Series</h2>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => dispatchForm({ creatingSeries: !creatingSeries })}
              >
                Add
              </Button>
            </div>

            {creatingSeries && (
              <form onSubmit={handleCreateSeries} className={styles.quickForm}>
                <input
                  type="text"
                  placeholder="Series Title"
                  aria-label="Series title"
                  className={styles.input}
                  value={newSeriesTitle}
                  onChange={(e) => dispatchForm({ newSeriesTitle: e.target.value })}
                  required
                />
                <Button variant="primary" onClick={handleCreateSeries}>
                  Save
                </Button>
              </form>
            )}

            <div className={styles.list}>
              {scholarSeries.map((s) => (
                <div key={s.id} className={styles.itemCard}>
                  <div className={styles.cardInfo}>
                    <span className={styles.itemTitle}>{s.title}</span>
                    <span className={`${styles.badge} ${styles[`badge-${s.status}`]}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className={styles.cardOrdering}>
                    <span className={styles.orderLabel}>Order Index:</span>
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
                <span className={styles.noData}>No series created yet.</span>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Collections</h2>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => dispatchForm({ creatingCollection: !creatingCollection })}
              >
                Add
              </Button>
            </div>

            {creatingCollection && (
              <form onSubmit={handleCreateCollection} className={styles.quickForm}>
                <input
                  type="text"
                  placeholder="Collection Title"
                  aria-label="Collection title"
                  className={styles.input}
                  value={newCollectionTitle}
                  onChange={(e) => dispatchForm({ newCollectionTitle: e.target.value })}
                  required
                />
                <Button variant="primary" onClick={handleCreateCollection}>
                  Save
                </Button>
              </form>
            )}

            <div className={styles.list}>
              {scholarCollections.map((c) => (
                <div key={c.id} className={styles.itemCard}>
                  <div className={styles.cardInfo}>
                    <span className={styles.itemTitle}>{c.title}</span>
                    <span className={`${styles.badge} ${styles[`badge-${c.status}`]}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className={styles.cardOrdering}>
                    <span className={styles.orderLabel}>Order Index:</span>
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
                <span className={styles.noData}>No collections created yet.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </ScreenView>
  );
}
