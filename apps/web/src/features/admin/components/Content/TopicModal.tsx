import { TopicFormModal } from "@/features/admin/components/TopicFormModal";
import type { TopicForEdit } from "@/features/admin/components/TopicFormModal";
import type { UpsertTopicDto } from "@sd/core-contracts";

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpsertTopicDto) => Promise<void>;
  topic: TopicForEdit | null;
}

export function TopicModal(props: TopicModalProps) {
  return <TopicFormModal {...props} />;
}
