"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Cloud, Mic, Search, CassetteTape, Settings, type LucideIcon } from "lucide-react";
import styles from "@/features/navigation/components/sidebar/sidebar-bottom.module.css";

type NavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  activeMatches: string[];
};

const navItems: NavItem[] = [
  { label: "Feeds", Icon: Cloud, href: "/feed", activeMatches: ["/feed"] },
  { label: "Live", Icon: Mic, href: "/live", activeMatches: ["/live"] },
  {
    label: "Search",
    Icon: Search,
    href: "/",
    activeMatches: ["/", "/searchprocessing"],
  },
  { label: "Lessons", Icon: CassetteTape, href: "/library", activeMatches: ["/library"] },
  { label: "Account", Icon: Settings, href: "/account", activeMatches: ["/account"] },
];

export function SidebarTablet() {
  const pathname = usePathname();
  const isAuthenticated = false;
  const accountHref = isAuthenticated ? "/account" : "/sign-in";
  const items = navItems.map((item) =>
    item.label === "Account" ? { ...item, href: accountHref } : item,
  );

  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <nav className={styles.nav} aria-label="Main">
        {items.map((item) => {
          const isActive = item.activeMatches.some(
            (match) => pathname === match || pathname.startsWith(`${match}/`),
          );
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.link, isActive && styles.active)}
            >
              <span className={styles.icon} aria-hidden="true">
                <item.Icon size={18} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
