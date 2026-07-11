import type { ReactNode } from "react";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { RoleBadge } from "../role-badge";
import styles from "./meta-details.module.css";

type MetaDetailsProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    createdAt: string;
  };
};

export function MetaDetails({ user }: MetaDetailsProps): ReactNode {
  const joinDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div className={styles.container}>
      <UserAvatar image={user.image} name={user.name} size={32} />
      <div className={styles.content}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{user.name ?? "Unnamed"}</div>
          <RoleBadge role={user.role} />
        </div>
        <div className={styles.details}>
          <div className={styles.email}>{user.email}</div>
          <div className={styles.joined}>Joined {joinDate}</div>
        </div>
      </div>
    </div>
  );
}
