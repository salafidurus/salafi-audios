"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useAuth, authClient } from "@/core/auth";
import { Button } from "@/shared/components/Button/Button";
import { Search } from "lucide-react";
import { routes } from "@sd/core-contracts";
import { LanguageSwitch } from "@/features/i18n";
import styles from "./top-auth-strip.module.css";
import searchStyles from "./search-action.module.css";

export function TopAuthStrip() {
  const { push } = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isHome = pathname === routes.home;
  const isSearch = pathname === routes.search;

  return (
    <div className={styles.strip} aria-label="Top actions">
      <div className={styles.inner}>
        <div className={clsx(styles.actions, isHome && styles.actionsHome)}>
          {!isHome && !isSearch ? (
            <Link href={routes.search} className={clsx(searchStyles.searchLink, styles.miniSearch)}>
              <Search size={16} className={searchStyles.icon} aria-hidden="true" />
              <span className={searchStyles.label}>Search</span>
            </Link>
          ) : null}

          <LanguageSwitch />

          {isAuthenticated && !isLoading && user ? (
            <>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {user.name ?? user.email ?? "Account"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void authClient.signOut().then(() => push(routes.home))}
              >
                Sign Out
              </Button>
            </>
          ) : !isAuthenticated && !isLoading ? (
            <>
              <Button variant="primary" size="sm" onClick={() => push(routes.signIn)}>
                Sign In
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
