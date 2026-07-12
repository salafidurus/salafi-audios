import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./user-avatar.module.css";

type UserAvatarProps = {
  image: string | null;
  name: string | null;
  size?: number;
};

export function UserAvatar({ image, name, size = 32 }: UserAvatarProps): ReactNode {
  if (image) {
    return (
      <Image src={image} alt="" className={styles.avatar} width={size} height={size} unoptimized />
    );
  }

  return (
    <div
      className={styles.fallback}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}
