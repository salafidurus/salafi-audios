import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./user-avatar.module.css";

type UserAvatarProps = {
  image: string | null;
  name: string | null;
  size?: number;
  className?: string;
  fill?: boolean;
};

export function UserAvatar({
  image,
  name,
  size,
  className,
  fill = false,
}: UserAvatarProps): ReactNode {
  if (fill) {
    if (image) {
      return (
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 20vw, 14vw"
          className={`${styles.avatar} ${className ?? ""}`}
          unoptimized
        />
      );
    }

    return (
      <div className={`${styles.fallbackFill} ${className ?? ""}`} aria-hidden="true">
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
    );
  }

  const avatarSize = size ?? 48;
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        className={`${styles.avatar} ${className ?? ""}`}
        width={avatarSize}
        height={avatarSize}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`${styles.fallback} ${className ?? ""}`}
      style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.4 }}
      aria-hidden="true"
    >
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}
