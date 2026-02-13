"use client";

import styles from "./home-hero.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/shared/components/button/button";

type HomeHeroItem = {
  title: string;
  description?: string;
  coverImageUrl?: string;
};

type HomeHeroProps = {
  items: HomeHeroItem[];
};

function clampIndex(value: number, length: number) {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

export function HomeHero({ items }: HomeHeroProps) {
  const slides = useMemo<HomeHeroItem[]>(() => {
    if (items.length > 0) return items;

    return [
      {
        title: "Begin your learning journey",
        description:
          "Explore published lectures organized by scholars, collections, and thematic series.",
      },
    ];
  }, [items]);

  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setIndex((current) => clampIndex(current + 1, slides.length));
    }, 8200);

    return () => window.clearInterval(id);
  }, [reduceMotion, slides.length]);

  const active = slides[clampIndex(index, slides.length)]!;
  const title = active.title;
  const description =
    active.description ??
    "Explore published lectures organized by scholars, collections, and thematic series.";
  const hasCarousel = slides.length > 1;

  return (
    <section className={styles.hero} aria-label="Featured series">
      <div
        key={active.coverImageUrl ?? active.title}
        className={styles.media}
        style={
          active.coverImageUrl ? { backgroundImage: `url(${active.coverImageUrl})` } : undefined
        }
        aria-hidden="true"
      />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.pill}>
            <span className={styles.pillIcon} aria-hidden="true">
              *
            </span>
            Featured Series
          </span>
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.copy}>{description}</p>

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

      {hasCarousel ? (
        <div className={styles.chrome} aria-hidden="true">
          <Button
            variant="ghost"
            size="icon"
            className={styles.heroArrowBtn}
            aria-label="Previous slide"
            onClick={() => setIndex((current) => clampIndex(current - 1, slides.length))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={styles.heroArrowBtn}
            aria-label="Next slide"
            onClick={() => setIndex((current) => clampIndex(current + 1, slides.length))}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      {hasCarousel ? (
        <div className={styles.dots} aria-label="Hero slide navigation">
          {slides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              className={
                slideIndex === clampIndex(index, slides.length) ? styles.dotActive : styles.dot
              }
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={slideIndex === clampIndex(index, slides.length) ? "true" : undefined}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
