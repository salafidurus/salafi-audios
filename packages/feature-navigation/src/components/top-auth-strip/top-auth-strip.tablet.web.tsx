"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useAuth } from "@sd/core-auth";
import { authClient } from "@sd/core-auth";
import { ButtonDesktopWeb } from "@sd/shared";
import { Search } from "lucide-react";
import styles from "./top-auth-strip.tablet.module.css";
import searchStyles from "./search-action.module.css";

export function TopAuthStripTablet() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isHome = pathname === "/";
  const isSearch = pathname === "/search";

  return (
    <div className={styles.strip} aria-label="Top actions">
      <div className={styles.inner}>
        <div className={clsx(styles.actions, isHome && styles.actionsHome)}>
          {!isHome && !isSearch ? (
            <Link href="/search" className={clsx(searchStyles.searchLink, styles.miniSearch)}>
              <Search size={16} className={searchStyles.icon} aria-hidden="true" />
              <span className={searchStyles.label}>Search</span>
            </Link>
          ) : null}

          {isAuthenticated && !isLoading && user ? (
            <>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {user.name ?? user.email ?? "Account"}
              </span>
              <ButtonDesktopWeb
                variant="ghost"
                size="sm"
                onClick={() => void authClient.signOut().then(() => router.push("/"))}
              >
                Sign Out
              </ButtonDesktopWeb>
            </>
          ) : !isAuthenticated && !isLoading ? (
            <>
              <ButtonDesktopWeb variant="ghost" size="sm" onClick={() => router.push("/sign-in")}>
                Sign In
              </ButtonDesktopWeb>
              <ButtonDesktopWeb variant="primary" size="sm" onClick={() => router.push("/sign-up")}>
                Create Free Account
              </ButtonDesktopWeb>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
