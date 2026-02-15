"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue } from "framer-motion";
import { Button } from "@/shared/components/button/button";
import type { RecommendationItem } from "@/features/home/types/home.types";
import { RecommendationCard } from "@/features/home/components/recommendations/card/card";
import styles from "./row.module.css";

type RowProps = {
  title: string;
  items: RecommendationItem[];
  variant?: "featured";
  density?: "tight" | "default";
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  pageSize?: number;
  emptyMessage?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function RecommendationRow({
  title,
  items,
  variant,
  density = "default",
  hasMore,
  isLoading,
  onLoadMore,
  pageSize = 8,
  emptyMessage,
  ctaLabel,
  ctaHref,
}: RowProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragX = useMotionValue(0);
  const dragStartLeft = useRef(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const showSkeletons = Boolean(isLoading && hasMore);
  const skeletonCount = useMemo(() => pageSize, [pageSize]);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isLoading) return;
        onLoadMore();
      },
      { rootMargin: "0px 120px 0px 120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      setCanPrev(node.scrollLeft > 4);
      setCanNext(node.scrollLeft < max - 4);
    };

    update();
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  const scrollByAmount = (direction: 1 | -1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const firstCard = node.querySelector<HTMLElement>(":scope > *");
    const gapValue = Number.parseFloat(
      getComputedStyle(node).columnGap || getComputedStyle(node).gap,
    );
    const gap = Number.isNaN(gapValue) ? 0 : gapValue;
    const amount = firstCard ? firstCard.offsetWidth + gap : Math.max(240, node.clientWidth * 0.8);
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className={styles.row} aria-label={title}>
      <div className={styles.head}>
        <h2>{title}</h2>
        <div className={styles.navButtons}>
          <Button
            variant="ghost"
            size="icon"
            className={styles.navBtn}
            aria-label="Scroll left"
            disabled={!canPrev}
            aria-disabled={!canPrev}
            onClick={() => scrollByAmount(-1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={styles.navBtn}
            aria-label="Scroll right"
            disabled={!canNext}
            aria-disabled={!canNext}
            onClick={() => scrollByAmount(1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>{emptyMessage ?? "No items yet."}</p>
          {ctaLabel && ctaHref ? (
            <Link href={ctaHref} className={styles.emptyCta}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      ) : (
        <motion.div
          className={`${styles.scroller} ${
            variant === "featured" ? styles.scrollerFeatured : ""
          } ${density === "tight" ? styles.scrollerTight : ""}`.trim()}
          role="list"
          ref={scrollerRef}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.04}
          style={{ x: dragX }}
          onDragStart={() => {
            dragStartLeft.current = scrollerRef.current?.scrollLeft ?? 0;
          }}
          onDrag={(_, info) => {
            if (!scrollerRef.current) return;
            scrollerRef.current.scrollLeft = dragStartLeft.current - info.offset.x;
            dragX.set(0);
          }}
        >
          {items.map((item) => (
            <RecommendationCard key={item.id} item={item} variant={variant} />
          ))}
          {showSkeletons
            ? Array.from({ length: skeletonCount }).map((_, idx) => (
                <div
                  key={`skeleton-${title}-${idx}`}
                  className={`${styles.skeletonCard} ${
                    variant === "featured" ? styles.skeletonCardFeatured : ""
                  }`.trim()}
                  aria-hidden="true"
                />
              ))
            : null}
          {hasMore ? <div ref={loadMoreRef} className={styles.loadMoreSentinel} /> : null}
        </motion.div>
      )}
    </section>
  );
}
