"use client";

import type { CreateScholarDto, UpdateScholarDto } from "@sd/core-contracts";
import { ScholarCreateModal } from "./ScholarCreateModal";
import { ScholarEditModal } from "./ScholarEditModal";

export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  country?: string | null;
  mainLanguage?: "en" | "ar" | null;
  socialTwitter?: string | null;
  socialTelegram?: string | null;
  socialYoutube?: string | null;
  socialWebsite?: string | null;
  title?: string | null;
  orderIndex?: number;
}

export interface ScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto | UpdateScholarDto, scholarId?: string) => Promise<void>;
  scholar?: ScholarForEdit | null;
  scholarId?: string | null;
}

export function ScholarModal({ isOpen, onClose, onSave, scholarId }: ScholarModalProps) {
  const isEditing = !!scholarId;

  if (isEditing && scholarId) {
    return (
      <ScholarEditModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={async (id, data) => onSave(data, id)}
        scholarId={scholarId}
      />
    );
  }

  return <ScholarCreateModal isOpen={isOpen} onClose={onClose} onSave={(data) => onSave(data)} />;
}
