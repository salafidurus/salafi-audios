import type { ReactNode } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";

import styles from "./AccessDialog.module.css";

/** Documents this module's responsibility and public boundary. */
interface RolesBannerProps {
  /** Effective roles that explain the permissions shown in the access dialog. */
  roles: string[];
}

/** Renders effective role badges when a user has at least one assigned role. */
export function RolesBanner({ roles }: RolesBannerProps): ReactNode {
  if (roles.length === 0) return null;

  return (
    <>
      <div className={styles.rolesBanner}>
        <span>Effective roles</span>
        <div className={styles.rolesList}>
          {roles.map((role) => (
            <Badge key={role} variant="outline" className={styles.roleBadge}>
              {role}
            </Badge>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}
