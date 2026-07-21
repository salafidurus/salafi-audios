"use client";

import { useEffect, useState } from "react";
import styles from "./table-of-contents.module.css";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector(".appNoConsentContent") as HTMLElement;
    if (!container) return;

    const handleScroll = () => {
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      const containerRect = container.getBoundingClientRect();
      const visibleSections = sectionElements
        .filter((s) => s.element)
        .map((s) => ({
          ...s,
          rect: s.element!.getBoundingClientRect(),
        }))
        .filter((s) => s.rect.top <= containerRect.bottom && s.rect.bottom >= containerRect.top);

      if (visibleSections.length > 0) {
        const mostVisibleSection = visibleSections.reduce((prev, current) => {
          const prevVisibility = Math.min(prev.rect.bottom, containerRect.bottom) - Math.max(prev.rect.top, containerRect.top);
          const currentVisibility = Math.min(current.rect.bottom, containerRect.bottom) - Math.max(current.rect.top, containerRect.top);
          return currentVisibility > prevVisibility ? current : prev;
        });
        setActiveSection(mostVisibleSection.id);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Call once on mount to set initial active section
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const container = document.querySelector(".appNoConsentContent") as HTMLElement;

    if (element && container) {
      const elementTop =
        element.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top: elementTop, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.header}>Contents</div>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={`${styles.link} ${activeSection === section.id ? styles.active : ""}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
