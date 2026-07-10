"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/core/auth";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";

export interface SignOutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignOutConfirmDialog({ isOpen, onClose }: SignOutConfirmDialogProps): ReactNode {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Are you sure you want to sign out?"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSignOut} disabled={isLoading}>
            {isLoading ? "Signing out…" : "Sign Out"}
          </Button>
        </>
      }
    />
  );
}
