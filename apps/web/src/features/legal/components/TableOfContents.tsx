/** Provides responsive section navigation for the shared legal document screens. */
"use client";

import { Menu, X } from "lucide-react";
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
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./table-of-contents.module.css";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

/**
 * Renders the legal document contents navigation.
 *
 * Desktop keeps the contents visible as a sidebar. At compact widths the
 * navigation starts closed behind a floating Menu button and opens as a
 * bounded panel, while section tracking and scrolling remain shared.
 */
export function TableOfContents({ sections }: TableOfContentsProps) {
  const { t } = useTranslation();
  const isRtl = useIsRtl();
  const [isOpen, setIsOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1200px)");
    const updateOpenState = () => setIsOpen(!mediaQuery.matches);
    updateOpenState();
    mediaQuery.addEventListener("change", updateOpenState);
    return () => mediaQuery.removeEventListener("change", updateOpenState);
  }, []);

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
    <SidebarProvider open={isOpen} className={styles.provider}>
      <nav
        aria-label={t("legal.contents", "Legal document contents")}
        className={styles.nav}
        data-open={isOpen}
      >
        <Sidebar collapsible="none" side={isRtl ? "left" : "right"} className={styles.container}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>{t("legal.contentsTitle", "On this page")}</span>
            <button
              type="button"
              className={styles.closeButton}
              aria-label={t("legal.closeContents", "Close table of contents")}
              onClick={() => setIsOpen(false)}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
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
        <button
          type="button"
          className={styles.floatingButton}
          aria-expanded={isOpen}
          aria-label={t("legal.openContents", "Open table of contents")}
          onClick={() => setIsOpen(true)}
        >
          <Menu aria-hidden="true" size={20} />
        </button>
      </nav>
    </SidebarProvider>
  );
}
