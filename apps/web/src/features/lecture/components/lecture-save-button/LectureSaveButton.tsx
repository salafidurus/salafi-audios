"use client";

import { useProgressStore } from "@sd/domain-progress";
import { ButtonDesktopWeb } from "../../../../shared/components/Button/Button";

export type LectureSaveButtonProps = {
  lectureId: string;
};

export function LectureSaveButton({ lectureId }: LectureSaveButtonProps) {
  const isSaved = useProgressStore((s) => s.actions.isSaved(lectureId));
  const addSaved = useProgressStore((s) => s.actions.addSaved);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);

  const handleClick = () => {
    if (isSaved) {
      removeSaved(lectureId);
    } else {
      addSaved(lectureId);
    }
  };

  return (
    <ButtonDesktopWeb
      variant={isSaved ? "surface" : "outline"}
      size="lg"
      onClick={handleClick}
      style={{ width: "100%", marginTop: 8 }}
    >
      {isSaved ? "✓ Saved" : "Save"}
    </ButtonDesktopWeb>
  );
}
