"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useAuth, authClient } from "../../../../core/auth";
import { Button } from "../../../../shared/components/Button/Button";
import { Search } from "lucide-react";
import { routes } from "@sd/core-contracts";
import styles from "./top-auth-strip.module.css";
import searchStyles from "./search-action.module.css";

export function TopAuthStrip() {
  const router = useRouter();
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

          {isAuthenticated && !isLoading && user ? (
            <>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {user.name ?? user.email ?? "Account"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void authClient.signOut().then(() => router.push(routes.home))}
              >
                Sign Out
              </Button>
            </>
          ) : !isAuthenticated && !isLoading ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push(routes.signIn)}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push(routes.signUp)}>
                Create Free Account
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
