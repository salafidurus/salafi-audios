"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue } from "framer-motion";
import { Button } from "@/shared/components/button/button";
import { ScholarAvatarCard } from "@/features/library/components/cards/scholar-avatar/scholar-avatar-card";
import type { Scholar } from "@/features/library/types/library.types";
import styles from "./senior-scholars.module.css";

type SeniorScholarsSectionProps = {
  scholars: Scholar[];
};

export function SeniorScholarsSection({ scholars }: SeniorScholarsSectionProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragX = useMotionValue(0);
  const dragStartLeft = useRef(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

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
  }, [scholars.length]);

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
    <section className={styles.section} aria-label="Senior scholars">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Senior Scholars of Our Era</h2>
            <p className={styles.subtitle}>
              A curated list of senior scholars whose lessons anchor the library.
            </p>
          </div>
        </div>

        <div className={styles.scrollerWrap}>
          <Button
            variant="ghost"
            size="icon"
            className={`${styles.navBtn} ${styles.navBtnLeft}`.trim()}
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
            className={`${styles.navBtn} ${styles.navBtnRight}`.trim()}
            aria-label="Scroll right"
            disabled={!canNext}
            aria-disabled={!canNext}
            onClick={() => scrollByAmount(1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Button>
          <motion.div
            className={styles.scroller}
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
            {scholars.map((scholar) => (
              <div key={scholar.id} role="listitem" className={styles.cardWrap}>
                <ScholarAvatarCard
                  href={`/scholars/${scholar.slug}`}
                  name={scholar.name}
                  featured
                  size="lg"
                  showInitial={false}
                  actionLabel="Follow"
                  actionDisabled
                  actionTitle="Sign in required"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
