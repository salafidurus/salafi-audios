"use client";

import React, { useReducer } from "react";
import Link from "next/link";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto, AdminListingListItemDto } from "@sd/core-contracts";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Button } from "@/shared/components/Button";
import styles from "./admin-scholar-detail.screen.module.css";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminScholarDetailScreenProps {
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

type DesktopFormState = {
  newSeriesTitle: string;
  newSeriesOrder: number;
  creatingSeries: boolean;
  newCollectionTitle: string;
  newCollectionOrder: number;
  creatingCollection: boolean;
};

type MobileFormState = {
  activeTab: "series" | "collections";
  newSeriesTitle: string;
  creatingSeries: boolean;
  newCollectionTitle: string;
  creatingCollection: boolean;
};

function reduceDesktop(
  state: DesktopFormState,
  patch: Partial<DesktopFormState>,
): DesktopFormState {
  return { ...state, ...patch };
}

function reduceMobile(state: MobileFormState, patch: Partial<MobileFormState>): MobileFormState {
  return { ...state, ...patch };
}

export function AdminScholarDetailScreen({ id }: AdminScholarDetailScreenProps) {
  const isDesktop = useIsDesktop();

  const { data: scholarsData } = useApiQuery<ScholarsListDto>(queryKeys.scholars.list(), () =>
    httpClient<ScholarsListDto>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const scholar = scholarsData?.scholars.find((s) => s.id === id);

  const { data: listingsData, refetch: refetchListings } = useApiQuery<AdminListingListItemDto[]>(
    ["admin-listings-scholar", id],
    () =>
      httpClient<AdminListingListItemDto[]>({
        url: `${endpoints.admin.listings.list}?scholarId=${id}`,
        method: "GET",
      }),
  );

  const [desktopState, dispatchDesktop] = useReducer(reduceDesktop, {
    newSeriesTitle: "",
    newSeriesOrder: 0,
    creatingSeries: false,
    newCollectionTitle: "",
    newCollectionOrder: 0,
    creatingCollection: false,
  });

  const [mobileState, dispatchMobile] = useReducer(reduceMobile, {
    activeTab: "series",
    newSeriesTitle: "",
    creatingSeries: false,
    newCollectionTitle: "",
    creatingCollection: false,
  });

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = isDesktop ? desktopState.newSeriesTitle : mobileState.newSeriesTitle;
    if (!title.trim()) return;

    try {
      await httpClient({
        url: endpoints.admin.listings.create,
        method: "POST",
        body: {
          scholarId: id,
          title: title,
          slug: slugify(title),
          format: "series",
          language: scholar?.mainLanguage || "ar",
          orderIndex: isDesktop ? Number(desktopState.newSeriesOrder) : undefined,
        },
      });
      if (isDesktop) {
        dispatchDesktop({ newSeriesTitle: "", newSeriesOrder: 0, creatingSeries: false });
      } else {
        dispatchMobile({ newSeriesTitle: "", creatingSeries: false });
      }
      refetchListings();
    } catch {
      // ignore
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = isDesktop ? desktopState.newCollectionTitle : mobileState.newCollectionTitle;
    if (!title.trim()) return;

    try {
      await httpClient({
        url: endpoints.admin.listings.create,
        method: "POST",
        body: {
          scholarId: id,
          title: title,
          slug: slugify(title),
          format: "collection",
          language: scholar?.mainLanguage || "ar",
          orderIndex: isDesktop ? Number(desktopState.newCollectionOrder) : undefined,
        },
      });
      if (isDesktop) {
        dispatchDesktop({
          newCollectionTitle: "",
          newCollectionOrder: 0,
          creatingCollection: false,
        });
      } else {
        dispatchMobile({ newCollectionTitle: "", creatingCollection: false });
      }
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
            <ArrowLeft size={16} /> {isDesktop ? "Back to Scholars" : "Back"}
          </Link>
        </div>

        <div className={styles.header}>
          <span className={styles.subtitle}>
            {isDesktop ? "Manage Scholar Details" : "Manage Scholar"}
          </span>
          <h1 className={styles.title}>
            {scholar?.name || (isDesktop ? "Loading Scholar..." : "Loading...")}
          </h1>
        </div>

        {isDesktop ? (
          <div className={styles.grid}>
            {/* Series Panel */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Series</h2>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => dispatchDesktop({ creatingSeries: !desktopState.creatingSeries })}
                >
                  Add Series
                </Button>
              </div>

              {desktopState.creatingSeries && (
                <form onSubmit={handleCreateSeries} className={styles.quickForm}>
                  <input
                    type="text"
                    placeholder="Series Title"
                    className={styles.input}
                    value={desktopState.newSeriesTitle}
                    onChange={(e) => dispatchDesktop({ newSeriesTitle: e.target.value })}
                    aria-label="Series title"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    className={styles.input}
                    value={desktopState.newSeriesOrder}
                    onChange={(e) => dispatchDesktop({ newSeriesOrder: Number(e.target.value) })}
                    aria-label="Series order index"
                  />
                  <div className={styles.formActions}>
                    <Button variant="primary" onClick={handleCreateSeries}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => dispatchDesktop({ creatingSeries: false })}
                    >
                      Cancel
                    </Button>
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
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() =>
                    dispatchDesktop({ creatingCollection: !desktopState.creatingCollection })
                  }
                >
                  Add Collection
                </Button>
              </div>

              {desktopState.creatingCollection && (
                <form onSubmit={handleCreateCollection} className={styles.quickForm}>
                  <input
                    type="text"
                    placeholder="Collection Title"
                    className={styles.input}
                    value={desktopState.newCollectionTitle}
                    onChange={(e) => dispatchDesktop({ newCollectionTitle: e.target.value })}
                    aria-label="Collection title"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    className={styles.input}
                    value={desktopState.newCollectionOrder}
                    onChange={(e) =>
                      dispatchDesktop({ newCollectionOrder: Number(e.target.value) })
                    }
                    aria-label="Collection order index"
                  />
                  <div className={styles.formActions}>
                    <Button variant="primary" onClick={handleCreateCollection}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => dispatchDesktop({ creatingCollection: false })}
                    >
                      Cancel
                    </Button>
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
                  <span className={styles.noData}>
                    No collections created for this scholar yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Buttons */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${mobileState.activeTab === "series" ? styles.tabActive : ""}`}
                onClick={() => dispatchMobile({ activeTab: "series" })}
              >
                Series ({scholarSeries.length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${mobileState.activeTab === "collections" ? styles.tabActive : ""}`}
                onClick={() => dispatchMobile({ activeTab: "collections" })}
              >
                Collections ({scholarCollections.length})
              </button>
            </div>

            {mobileState.activeTab === "series" ? (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Series</h2>
                  <Button
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => dispatchMobile({ creatingSeries: !mobileState.creatingSeries })}
                  >
                    Add
                  </Button>
                </div>

                {mobileState.creatingSeries && (
                  <form onSubmit={handleCreateSeries} className={styles.quickForm}>
                    <input
                      type="text"
                      placeholder="Series Title"
                      aria-label="Series title"
                      className={styles.input}
                      value={mobileState.newSeriesTitle}
                      onChange={(e) => dispatchMobile({ newSeriesTitle: e.target.value })}
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
                    onClick={() =>
                      dispatchMobile({ creatingCollection: !mobileState.creatingCollection })
                    }
                  >
                    Add
                  </Button>
                </div>

                {mobileState.creatingCollection && (
                  <form onSubmit={handleCreateCollection} className={styles.quickForm}>
                    <input
                      type="text"
                      placeholder="Collection Title"
                      aria-label="Collection title"
                      className={styles.input}
                      value={mobileState.newCollectionTitle}
                      onChange={(e) => dispatchMobile({ newCollectionTitle: e.target.value })}
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
          </>
        )}
      </div>
    </ScreenView>
  );
}
