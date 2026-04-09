import { useProgressStore } from "@sd/domain-progress";
import { ButtonMobileNative } from "../../../../shared/components/Button/Button";

export type LectureSaveButtonNativeProps = {
  lectureId: string;
};

export function LectureSaveButtonNative({ lectureId }: LectureSaveButtonNativeProps) {
  const isSaved = useProgressStore((s) => s.actions.isSaved(lectureId));
  const addSaved = useProgressStore((s) => s.actions.addSaved);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);

  const handlePress = () => {
    if (isSaved) {
      removeSaved(lectureId);
    } else {
      addSaved(lectureId);
    }
  };

  return (
    <ButtonMobileNative
      variant={isSaved ? "surface" : "outline"}
      size="lg"
      fullWidth
      label={isSaved ? "✓ Saved" : "Save"}
      onPress={handlePress}
    />
  );
}
