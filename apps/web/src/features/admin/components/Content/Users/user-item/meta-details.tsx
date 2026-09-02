import type { ReactNode } from "react";

import { useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { MarqueeText } from "@/shared/components/MarqueeText";

import styles from "./meta-details.module.css";

/** Documents this module's responsibility and public boundary. */
type MetaDetailsProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    roles: string[];
    createdAt: string;
  };
  showJoinedDate?: boolean;
};

export function MetaDetails({ user, showJoinedDate = true }: MetaDetailsProps): ReactNode {
  const { i18n } = useTranslation();
  const joinDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { timeZone: "UTC" }),
    [i18n.language],
  );
  const joinDate = joinDateFormatter.format(new Date(user.createdAt));

  return (
    <div className={styles.content}>
      <div className={styles.nameRow}>
        <MarqueeText
          text={user.name ?? "Unnamed"}
          className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
        />
      </div>
      <div className={styles.details}>
        <MarqueeText
          text={user.email}
          className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
        />
        {showJoinedDate && <div className={styles.joined}>Joined {joinDate}</div>}
      </div>
    </div>
  );
}
