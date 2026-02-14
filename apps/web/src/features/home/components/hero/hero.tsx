"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListVideo,
  Play,
  Sparkle,
} from "lucide-react";
import type { RecommendationHeroItem } from "@/features/home/api/public-api";
import { Button } from "@/shared/components/button/button";
import styles from "./hero.module.css";

type HeroProps = {
  items: RecommendationHeroItem[];
};

function clampIndex(value: number, length: number) {
  if (length <= 1) return 0;
  return Math.min(Math.max(value, 0), length - 1);
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${totalMinutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function Hero({ items }: HeroProps) {
  const slides = useMemo<RecommendationHeroItem[]>(() => {
    if (items.length > 0) return items.slice(0, 3);

    return [
      {
        kind: "series",
        entityId: "fallback",
        entitySlug: "fallback",
        headline: "Tawhid First",
        title: "Featured study",
        description:
          "Explore published lectures organized by scholars, collections, and thematic series.",
        lessonCount: undefined,
        totalDurationSeconds: undefined,
        presentedBy: "Salafi Durus",
      },
    ];
  }, [items]);

  const hasCarousel = slides.length > 1;
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

  const featuredLabel = (() => {
    if (active.kind === "lecture") return "Featured lecture";
    if (active.kind === "collection") return "Featured collection";
    return "Featured series";
  })();

  const lessonCount = active.lessonCount;
  const totalDurationSeconds = active.totalDurationSeconds;

  return (
    <section
      ref={(el) => {
        heroRef.current = el;
      }}
      className={styles.hero}
      aria-label="Featured study"
    >
      <div className={styles.inner}>
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
              key={active.entityId}
              className={styles.slide}
              initial={{ opacity: 0, x: dir === 1 ? 36 : -36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir === 1 ? -32 : 32 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              <div className={styles.coverWrap}>
                <div
                  className={styles.cover}
                  style={
                    active.coverImageUrl
                      ? { backgroundImage: `url(${active.coverImageUrl})` }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <div className={styles.coverGlow} aria-hidden="true" />
              </div>

              <div className={styles.content}>
                <div className={styles.kickerRow}>
                  <span className={styles.pill}>
                    <span className={styles.pillIcon} aria-hidden="true">
                      <Sparkle size={14} aria-hidden="true" />
                    </span>
                    {featuredLabel}
                  </span>
                </div>

                <div className={styles.tagline}>{active.headline}</div>

                <h1 className={styles.title}>{active.title}</h1>

                <div className={styles.scholarName}>{active.presentedBy}</div>

                <div className={styles.meta}>
                  {typeof lessonCount === "number" ? (
                    <span className={styles.metaItem}>
                      <ListVideo size={16} aria-hidden="true" />
                      {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                    </span>
                  ) : null}
                  {typeof totalDurationSeconds === "number" && totalDurationSeconds > 0 ? (
                    <span className={styles.metaItem}>
                      <Clock3 size={16} aria-hidden="true" />
                      {formatDuration(totalDurationSeconds)}
                    </span>
                  ) : null}
                </div>

                {active.description ? (
                  <p className={styles.description}>{active.description}</p>
                ) : null}

                <div className={styles.actions}>
                  <Button variant="primary" size="lg" aria-disabled="true">
                    <Play size={18} aria-hidden="true" />
                    Start learning
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Save"
                    aria-disabled="true"
                    className={styles.heroIconBtn}
                  >
                    <Bookmark size={18} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {hasCarousel ? (
          <div className={styles.dots} aria-label="Hero slide navigation">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.entityId}
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
