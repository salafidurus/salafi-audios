"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Layers3,
  LibraryBig,
  ListVideo,
  Sparkle,
} from "lucide-react";
import { Button } from "@/shared/components/button/button";
import buttonStyles from "@/shared/components/button/button.module.css";
import styles from "./scholar-hero.module.css";

const FALLBACK_IMAGE = "/dev-mock/template-4-to-5-image.jpg";
const MAX_NAME_LENGTH = 25;

export type ScholarHeroItem = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  bio?: string;
  imageUrl?: string;
  collectionsCount: number;
  standaloneSeriesCount: number;
  standaloneLecturesCount: number;
  isKibar?: boolean;
};

type ScholarHeroProps = {
  items: ScholarHeroItem[];
  title?: string;
  description?: string;
  singleMode?: boolean;
  onBookmarkClick?: (item: ScholarHeroItem) => void;
};

function clampIndex(value: number, length: number) {
  if (length <= 1) return 0;
  return Math.min(Math.max(value, 0), length - 1);
}

export function ScholarHero({
  items,
  title,
  description,
  singleMode = false,
  onBookmarkClick,
}: ScholarHeroProps) {
  const slides = useMemo<ScholarHeroItem[]>(() => {
    if (items.length > 0) return singleMode ? items.slice(0, 1) : items.slice(0, 10);

    return [];
  }, [items, singleMode]);

  const hasCarousel = slides.length > 1 && !singleMode;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;

    const html = document.documentElement;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          html.dataset.heroInview = "true";
        } else {
          delete html.dataset.heroInview;
        }
      },
      { threshold: 0.35 },
    );

    obs.observe(node);
    return () => {
      obs.disconnect();
      delete html.dataset.heroInview;
    };
  }, []);

  useEffect(() => {
    if (!hasCarousel) return;

    const id = window.setInterval(() => {
      setIndex((current) => {
        if (dir === 1 && current >= slides.length - 1) return current;
        if (dir === -1 && current <= 0) return current;
        return clampIndex(current + dir, slides.length);
      });
    }, 8200);

    return () => window.clearInterval(id);
  }, [dir, hasCarousel, slides.length]);

  const active = slides[clampIndex(index, slides.length)]!;
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  const goPrev = () => {
    if (!canPrev) return;
    setDir(-1);
    setIndex((v) => clampIndex(v - 1, slides.length));
  };

  const goNext = () => {
    if (!canNext) return;
    setDir(1);
    setIndex((v) => clampIndex(v + 1, slides.length));
  };

  return (
    <section
      ref={(el) => {
        heroRef.current = el;
      }}
      className={styles.hero}
      aria-label={singleMode ? "Scholar profile" : "Senior Salafi Scholars"}
    >
      {title && description && (
        <div className={styles.textBlock}>
          <h2 className={styles.textBlockTitle}>{title}</h2>
          <p className={styles.textBlockDescription}>{description}</p>
        </div>
      )}
      <div className={`${styles.inner} ${title && description ? styles.innerWithTextBlock : ""}`}>
        <motion.div
          className={styles.stage}
          drag={hasCarousel ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.06}
          dragDirectionLock
          style={hasCarousel ? { cursor: "grab" } : undefined}
          onDragEnd={(_, info) => {
            if (!hasCarousel) return;

            if (info.offset.x > 80 && canPrev) {
              goPrev();
            } else if (info.offset.x < -80 && canNext) {
              goNext();
            }
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              className={styles.slide}
              initial={{ opacity: 0, x: dir === 1 ? 36 : -36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir === 1 ? -32 : 32 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              <div className={styles.coverWrap}>
                <div className={styles.cover} aria-hidden="true">
                  <Image
                    src={active.imageUrl || FALLBACK_IMAGE}
                    alt={active.name}
                    fill
                    className={styles.coverImage}
                    sizes="(max-width: 820px) 280px, 352px"
                    priority={index === 0}
                  />
                </div>
                <div className={styles.coverGlow} aria-hidden="true" />
              </div>

              <div className={styles.content}>
                <div className={styles.kickerRow}>
                  <span className={styles.pill}>
                    <span className={styles.pillIcon} aria-hidden="true">
                      <Sparkle size={14} aria-hidden="true" />
                    </span>
                    {active.isKibar ? "Senior Salafi Scholar" : "Salafi Scholar"}
                  </span>
                </div>

                {active.subtitle && <div className={styles.tagline}>{active.subtitle}</div>}

                <h1 className={styles.title} title={active.name}>
                  {active.name.length > MAX_NAME_LENGTH ? (
                    <span className={styles.marquee}>
                      <span className={styles.marqueeInner}>{active.name}</span>
                    </span>
                  ) : (
                    active.name
                  )}
                </h1>

                <div className={styles.meta}>
                  {active.collectionsCount > 0 && (
                    <span className={styles.metaItem}>
                      <LibraryBig size={16} aria-hidden="true" />
                      {active.collectionsCount}{" "}
                      {active.collectionsCount === 1 ? "Collection" : "Collections"}
                    </span>
                  )}
                  {active.standaloneSeriesCount > 0 && (
                    <span className={styles.metaItem}>
                      <Layers3 size={16} aria-hidden="true" />
                      {active.standaloneSeriesCount}{" "}
                      {active.standaloneSeriesCount === 1 ? "Series" : "Series"}
                    </span>
                  )}
                  {active.standaloneLecturesCount > 0 && (
                    <span className={styles.metaItem}>
                      <ListVideo size={16} aria-hidden="true" />
                      {active.standaloneLecturesCount}{" "}
                      {active.standaloneLecturesCount === 1 ? "Lecture" : "Lectures"}
                    </span>
                  )}
                </div>

                {active.bio ? (
                  <p className={styles.description}>
                    {active.bio.length > 150 ? `${active.bio.substring(0, 150)}...` : active.bio}
                  </p>
                ) : null}

                {!singleMode && (
                  <div className={styles.actions}>
                    <Link
                      href={`/scholars/${active.slug}`}
                      className={`${buttonStyles.button} ${buttonStyles["variant-primary"]} ${buttonStyles["size-lg"]}`}
                    >
                      View Details
                    </Link>

                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Bookmark scholar"
                      className={styles.heroIconBtn}
                      onClick={() => onBookmarkClick?.(active)}
                    >
                      <Bookmark size={18} aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {hasCarousel ? (
          <div className={styles.dots} aria-label="Scholar slide navigation">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                className={slideIndex === index ? styles.dotActive : styles.dot}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index ? "true" : undefined}
                onClick={() => {
                  setDir(slideIndex > index ? 1 : -1);
                  setIndex(slideIndex);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {hasCarousel ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={`${styles.edgeBtn} ${styles.edgeBtnLeft}`}
            aria-label="Previous"
            disabled={!canPrev}
            aria-disabled={!canPrev}
            onClick={goPrev}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${styles.edgeBtn} ${styles.edgeBtnRight}`}
            aria-label="Next"
            disabled={!canNext}
            aria-disabled={!canNext}
            onClick={goNext}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Button>
        </>
      ) : null}
    </section>
  );
}
