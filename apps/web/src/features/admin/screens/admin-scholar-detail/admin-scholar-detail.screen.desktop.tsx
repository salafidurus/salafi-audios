"use client";

import React, { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  AdminSeriesListItemDto,
  AdminCollectionListItemDto,
} from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./admin-scholar-detail.screen.desktop.module.css";
import { ArrowLeft, Save, Plus, Edit } from "lucide-react";

interface AdminScholarDetailDesktopScreenProps {
  id: string;
}

type ScholarsListDto = { scholars: ScholarListItemDto[] };
type SeriesListDto = { items: AdminSeriesListItemDto[] };
type CollectionsListDto = { items: AdminCollectionListItemDto[] };

export function AdminScholarDetailDesktopScreen({ id }: AdminScholarDetailDesktopScreenProps) {
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

  // Series Form State
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesOrder, setNewSeriesOrder] = useState(0);
  const [creatingSeries, setCreatingSeries] = useState(false);

  // Collection Form State
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newCollectionOrder, setNewCollectionOrder] = useState(0);
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
          orderIndex: Number(newSeriesOrder),
        },
      });
      setNewSeriesTitle("");
      setNewSeriesOrder(0);
      setCreatingSeries(false);
      refetchSeries();
    } catch (err) {
      console.error("Failed to create series", err);
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
          orderIndex: Number(newCollectionOrder),
        },
      });
      setNewCollectionTitle("");
      setNewCollectionOrder(0);
      setCreatingCollection(false);
      refetchCollections();
    } catch (err) {
      console.error("Failed to create collection", err);
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
    } catch (err) {
      console.error("Failed to update series orderIndex", err);
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
    } catch (err) {
      console.error("Failed to update collection orderIndex", err);
    }
  };

  const scholarSeries = seriesData ?? [];
  const scholarCollections = collectionsData ?? [];

  return (
    <ScreenView>
      <div className={styles.container}>
        <div className={styles.backNav}>
          <a href="/admin/scholars" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Scholars
          </a>
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
                onClick={() => setCreatingSeries(!creatingSeries)}
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
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Order"
                  className={styles.input}
                  value={newSeriesOrder}
                  onChange={(e) => setNewSeriesOrder(Number(e.target.value))}
                />
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setCreatingSeries(false)}
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
                      onBlur={(e) => handleUpdateSeriesOrder(s.id, Number(e.target.value))}
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
                onClick={() => setCreatingCollection(!creatingCollection)}
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
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Order"
                  className={styles.input}
                  value={newCollectionOrder}
                  onChange={(e) => setNewCollectionOrder(Number(e.target.value))}
                />
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setCreatingCollection(false)}
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
                      onBlur={(e) => handleUpdateCollectionOrder(c.id, Number(e.target.value))}
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
