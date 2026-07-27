import type { ReactNode } from "react";

import { MarqueeText } from "@/shared/components/MarqueeText";

import { RoleBadge } from "../role-badge";
import styles from "./meta-details.module.css";

type MetaDetailsProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    roles: string[];
    createdAt: string;
  };
};

export function MetaDetails({ user }: MetaDetailsProps): ReactNode {
  const joinDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div className={styles.content}>
      <div className={styles.nameRow}>
        <MarqueeText
          text={user.name ?? "Unnamed"}
          className="text-[var(--content-strong)] font-semibold [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
        />
        <RoleBadge roles={user.roles} />
      </div>
      <div className={styles.details}>
        <MarqueeText
          text={user.email}
          className="text-[var(--content-muted)] font-normal [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
        />
        <div className={styles.joined}>Joined {joinDate}</div>
      </div>
    </div>
  );
}
