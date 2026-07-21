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
      const currentSection = sectionElements
        .filter((s) => s.element)
        .find((s) => {
          const rect = s.element!.getBoundingClientRect();
          return rect.top <= containerRect.top + 150;
        });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const container = document.querySelector(".appNoConsentContent") as HTMLElement;

    if (element && container) {
      const elementTop = element.offsetTop - container.offsetTop;
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
