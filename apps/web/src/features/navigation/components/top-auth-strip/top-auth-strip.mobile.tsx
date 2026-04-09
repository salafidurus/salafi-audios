"use client";

import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { Button } from "../../../../shared/components/Button/Button";
import { routes } from "@sd/core-contracts";
import styles from "./top-auth-strip.mobile.module.css";

export function TopAuthStripMobile() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === routes.home;

  return (
    <div className={styles.strip} aria-label="Top actions">
      <div className={styles.inner}>
        <div className={clsx(styles.actions, isHome && styles.actionsHome)}>
          <Button variant="ghost" size="sm" onClick={() => router.push(routes.signIn)}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
