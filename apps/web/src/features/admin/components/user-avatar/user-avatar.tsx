import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./user-avatar.module.css";

type UserAvatarProps = {
  image: string | null;
  name: string | null;
};

export function UserAvatar({ image, name }: UserAvatarProps): ReactNode {
  if (image) {
    return (
      <Image src={image} alt="" className={styles.avatar} width={32} height={32} unoptimized />
    );
  }

  return (
    <div className={styles.fallback} aria-hidden="true">
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}
