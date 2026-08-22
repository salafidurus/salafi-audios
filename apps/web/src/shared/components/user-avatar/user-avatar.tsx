import type { ReactNode } from "react";

import { AppAvatar } from "@/shared/components/app-avatar";

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
  return <AppAvatar image={image} name={name} size={size} className={className} fill={fill} />;
}
