/** Documents this module's responsibility and public boundary. */
"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";

import styles from "./scroll-to-top-button.module.css";

const SCROLL_THRESHOLD = 320;

const scrollToTop = () => {
  const scrollContainer = document.querySelector<HTMLElement>(".appConsentContent");
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }
};

/** Shows a localized smooth-scroll control after the app content passes the threshold. */
/** Shows a localized smooth-scroll control after the app content passes the threshold. */
export function ScrollToTopButton() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>(".appConsentContent");
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
    <Button
      variant="default"
      size="lg"
      className={styles.button}
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      type="button"
    >
      <ArrowUp size={20} />
      <span>{label}</span>
    </Button>
  );
}
