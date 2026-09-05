import type { ReactNode } from "react";

import { AppAvatar } from "@/shared/components/app-avatar";

/** Documents this module's responsibility and public boundary. */
type UserAvatarProps = {
  image: string | null;
  name: string | null;
  size?: number;
  className?: string;
  fill?: boolean;
};

/** Renders a user image or deterministic initials fallback at the requested size. */
export function UserAvatar({
  image,
  name,
  size,
  className,
  fill = false,
}: UserAvatarProps): ReactNode {
  return <AppAvatar image={image} name={name} size={size} className={className} fill={fill} />;
}
