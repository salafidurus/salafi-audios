"use client";

import React, { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  AdminSeriesListItemDto,
  AdminCollectionListItemDto,
} from "@sd/core-contracts";
import Link from "next/link";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./admin-scholar-detail.screen.mobile.module.css";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminScholarDetailMobileScreenProps {
  id: string;
}

type ScholarsListDto = { scholars: ScholarListItemDto[] };

export function AdminScholarDetailMobileScreen({ id }: AdminScholarDetailMobileScreenProps) {
  // Fetch Scholar
  const { data: scholarsData } = useApiQuery<ScholarsListDto>(queryKeys.scholars.list(), () =>
    httpClient<ScholarsListDto>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const scholar = scholarsData?.scholars.find((s) => s.id === id);

  // Fetch Series
  const { data: seriesData, refetch: refetchSeries } = useApiQuery<AdminSeriesListItemDto[]>(
    ["series", "list", id],
    () =>
      httpClient<AdminSeriesListItemDto[]>({
        url: `${endpoints.admin.series.list}?scholarId=${id}`,
        method: "GET",
      }),
  );

  // Fetch Collections
  const { data: collectionsData, refetch: refetchCollections } = useApiQuery<
    AdminCollectionListItemDto[]
  >(["collections", "list", id], () =>
    httpClient<AdminCollectionListItemDto[]>({
      url: `${endpoints.admin.collections.list}?scholarId=${id}`,
      method: "GET",
    }),
  );

  const [activeTab, setActiveTab] = useState<"series" | "collections">("series");

  // Series Form State
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [creatingSeries, setCreatingSeries] = useState(false);

  // Collection Form State
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeriesTitle.trim()) return;

    try {
      await httpClient({
        url: endpoints.admin.series.create,
        method: "POST",
        body: {
          scholarId: id,
          title: newSeriesTitle,
        },
      });
      setNewSeriesTitle("");
      setCreatingSeries(false);
      refetchSeries();
    } catch {
      // ignore
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    try {
      await httpClient({
        url: endpoints.admin.collections.create,
        method: "POST",
        body: {
          scholarId: id,
          title: newCollectionTitle,
        },
      });
      setNewCollectionTitle("");
      setCreatingCollection(false);
      refetchCollections();
    } catch {
      // ignore
    }
  };

  const handleUpdateSeriesOrder = async (seriesId: string, orderIndex: number) => {
    try {
      await httpClient({
        url: endpoints.admin.series.update(seriesId),
        method: "PATCH",
        body: { orderIndex },
      });
      refetchSeries();
    } catch {
      // ignore
    }
  };

  const handleUpdateCollectionOrder = async (collectionId: string, orderIndex: number) => {
    try {
      await httpClient({
        url: endpoints.admin.collections.update(collectionId),
        method: "PATCH",
        body: { orderIndex },
      });
      refetchCollections();
    } catch {
      // ignore
    }
  };

  const scholarSeries = seriesData ?? [];
  const scholarCollections = collectionsData ?? [];

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
            onClick={() => setActiveTab("series")}
          >
            Series ({scholarSeries.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "collections" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("collections")}
          >
            Collections ({scholarCollections.length})
          </button>
        </div>

        {activeTab === "series" ? (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Series</h2>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => setCreatingSeries(!creatingSeries)}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {creatingSeries && (
              <form onSubmit={handleCreateSeries} className={styles.quickForm}>
                <input
                  type="text"
                  placeholder="Series Title"
                  className={styles.input}
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  required
                />
                <button type="submit" className={styles.saveBtn}>
                  Save
                </button>
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
                      onBlur={(e) => handleUpdateSeriesOrder(s.id, Number(e.target.value))}
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
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => setCreatingCollection(!creatingCollection)}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {creatingCollection && (
              <form onSubmit={handleCreateCollection} className={styles.quickForm}>
                <input
                  type="text"
                  placeholder="Collection Title"
                  className={styles.input}
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  required
                />
                <button type="submit" className={styles.saveBtn}>
                  Save
                </button>
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
                      onBlur={(e) => handleUpdateCollectionOrder(c.id, Number(e.target.value))}
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
