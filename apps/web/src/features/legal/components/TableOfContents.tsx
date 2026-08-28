/** Documents this module's responsibility and public boundary. */
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/shared/components/ui/sidebar";

import styles from "./table-of-contents.module.css";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".appConsentContent");
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const visibleSections = sections.reduce<Array<{ id: string; rect: DOMRect }>>(
        (acc, section) => {
          const element = document.getElementById(section.id);
          if (!element) return acc;
          const rect = element.getBoundingClientRect();
          if (rect.top <= containerRect.bottom && rect.bottom >= containerRect.top) {
            acc.push({ id: section.id, rect });
          }
          return acc;
        },
        [],
      );

      if (visibleSections.length > 0) {
        const mostVisibleSection = visibleSections.reduce((prev, current) => {
          const prevVisibility =
            Math.min(prev.rect.bottom, containerRect.bottom) -
            Math.max(prev.rect.top, containerRect.top);
          const currentVisibility =
            Math.min(current.rect.bottom, containerRect.bottom) -
            Math.max(current.rect.top, containerRect.top);
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
    const container = document.querySelector<HTMLElement>(".appConsentContent");

    if (element && container) {
      const elementTop =
        element.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      container.scrollTo({
        top: elementTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <SidebarProvider className={styles.provider}>
      <nav aria-label={t("legal.contents", "Legal document contents")} className={styles.nav}>
        <Sidebar collapsible="none" side="right" className={styles.container}>
          <SidebarContent className={styles.content}>
            <SidebarGroup className={styles.group}>
              <SidebarGroupLabel className={styles.title}>
                {t("legal.contentsTitle", "On this page")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sections.map((section, index) => (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        type="button"
                        size="sm"
                        className={styles.link}
                        isActive={activeSection === section.id}
                        aria-current={activeSection === section.id ? "location" : undefined}
                        onClick={() => scrollToSection(section.id)}
                      >
                        <span className={styles.number} aria-hidden="true">
                          {index + 1}.
                        </span>
                        {section.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </nav>
    </SidebarProvider>
  );
}
