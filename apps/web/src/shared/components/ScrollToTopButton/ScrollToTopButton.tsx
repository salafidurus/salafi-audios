"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./scroll-to-top-button.module.css";

const SCROLL_THRESHOLD = 320;

const scrollToTop = () => {
  const scrollContainer = document.querySelector(".appContent") as HTMLElement;
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export function ScrollToTopButton() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector(".appContent") as HTMLElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsVisible(scrollContainer.scrollTop > SCROLL_THRESHOLD);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const label = t("common.scrollToTop", "Return to top");

  return (
    <button
      className={styles.button}
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      type="button"
    >
      <ArrowUp size={20} />
      <span>{label}</span>
    </button>
  );
}
