"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/core/auth/auth-client";
import { AccountScreen } from "./account.screen";
import type { AccountScreenProps } from "./account.screen";

type Props = Omit<AccountScreenProps, "onSignOut">;

export function AccountActions(props: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return <AccountScreen {...props} onSignOut={handleSignOut} />;
}
