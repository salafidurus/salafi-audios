import type { ReactNode } from "react";

import { AppAvatar } from "@/shared/components/app-avatar";

/** Props for rendering a user's image with a name-based fallback. */
type UserAvatarProps = {
  image: string | null;
  name: string | null;
  size?: number;
  className?: string;
  fill?: boolean;
};

/** Renders the shared avatar treatment used for authenticated users. */
export function UserAvatar({
  image,
  name,
  size,
  className,
  fill = false,
}: UserAvatarProps): ReactNode {
  return <AppAvatar image={image} name={name} size={size} className={className} fill={fill} />;
}
