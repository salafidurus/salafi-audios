import { EntityCard } from "@/features/library/components/cards/entity/entity-card";

type LectureCardProps = {
  href: string;
  title: string;
  description?: string;
  published?: string;
};

export function LectureCard({ href, title, description, published }: LectureCardProps) {
  return (
    <EntityCard
      href={href}
      title={title}
      description={description}
      meta={published ? `Published ${published}` : undefined}
    />
  );
}
