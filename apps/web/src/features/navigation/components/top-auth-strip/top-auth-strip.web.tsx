"use client";

import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/shared/components/button/button";
import { SearchButton } from "@/features/search/components/search-button";
import styles from "@/features/navigation/components/top-auth-strip/top-auth-strip.web.module.css";

export function TopAuthStripWeb() {
  const router = useRouter();
  const pathname = usePathname();
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  );
}
