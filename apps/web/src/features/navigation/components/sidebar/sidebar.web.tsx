"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  PanelLeftOpen,
  PanelRightOpen,
  Cloud,
  Mic,
  CassetteTape,
  Settings,
  type LucideIcon,
} from "lucide-react";
import styles from "@/features/navigation/components/sidebar/sidebar.module.css";

type NavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  activeMatch: string;
};

const navItems: NavItem[] = [
  { label: "Feeds", Icon: Cloud, href: "/feed", activeMatch: "/feed" },
  { label: "Live", Icon: Mic, href: "/live", activeMatch: "/live" },
  { label: "Lessons", Icon: CassetteTape, href: "/library", activeMatch: "/library" },
];

export function SidebarWeb() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAuthenticated = false;
  const accountHref = isAuthenticated ? "/account" : "/sign-in";

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", collapsed ? "4.5rem" : "16.5rem");
  }, [collapsed]);

  return (
    <aside
      className={clsx(styles.sidebar, collapsed && styles.collapsed)}
      aria-label="Primary sidebar"
      data-collapsed={collapsed}
    >
      <div className={styles.brandRow}>
        <Link href="/" className={styles.brand} aria-label="Salafi Durus">
          <span className={styles.brandMark} aria-hidden="true">
            <Image
              src="/logo/logo_72.png"
              alt=""
              width={32}
              height={32}
              priority
              className={styles.brandImg}
            />
          </span>
          <span className={styles.brandText}>Salafi Durus</span>
        </Link>
        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelRightOpen size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </div>
      <nav className={styles.nav} aria-label="Main">
        {navItems.map((item) => {
          const isActive =
            pathname === item.activeMatch || pathname.startsWith(`${item.activeMatch}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.link, isActive && styles.active)}
            >
              <span className={styles.icon} aria-hidden="true">
                <item.Icon size={18} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href={accountHref}
          className={clsx(styles.link, pathname.startsWith("/account") && styles.active)}
        >
          <span className={styles.icon} aria-hidden="true">
            <Settings size={18} />
          </span>
          <span className={styles.label}>Account</span>
        </Link>
      </nav>
    </aside>
  );
}
