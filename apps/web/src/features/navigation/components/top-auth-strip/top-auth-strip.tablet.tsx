"use client";

import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/core/auth/use-auth";
import { authClient } from "@/core/auth/auth-client";
import { Button } from "@/shared/components/button/button";
import { SearchButton } from "@/features/search/components/search-button";
import styles from "@/features/navigation/components/top-auth-strip/top-auth-strip.tablet.module.css";

export function TopAuthStripTablet() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const isHome = pathname === "/";
  const isSearch = pathname === "/searchprocessing";

  return (
    <div className={styles.strip} aria-label="Top actions">
      <div className={styles.inner}>
        <div className={clsx(styles.actions, isHome && styles.actionsHome)}>
          {!isHome && !isSearch ? (
            <SearchButton
              href="/searchprocessing"
              size="sm"
              label="Search"
              className={styles.miniSearch}
            />
          ) : null}

          {status === "authenticated" && user ? (
            <>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {user.name ?? user.email ?? "Account"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void authClient.signOut().then(() => router.push("/"))}
              >
                Sign Out
              </Button>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/sign-in")}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>
                Create Free Account
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
