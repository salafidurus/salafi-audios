import Image from "next/image";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/components/Button";
import styles from "./scholar-card.module.css";

export interface ScholarCardProps {
  id: string;
  name: string;
  slug: string;
  isKibar: boolean;
  lectureCount: number;
  imageUrl?: string;
  onEdit: () => void;
}

export function ScholarCard({
  name,
  slug,
  isKibar,
  lectureCount,
  imageUrl,
  onEdit,
}: ScholarCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            className={styles.avatarImg}
            width={48}
            height={48}
            unoptimized
          />
        ) : (
          <span className={styles.avatarFallback}>{name.charAt(0)}</span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.slug}>{slug}</p>
        <div className={styles.meta}>
          {isKibar && <span className={styles.badge}>Kibar</span>}
          <span className={styles.lectures}>{lectureCount} lectures</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        aria-label={`Edit ${name}`}
        icon={<Pencil size={16} />}
      />
    </div>
  );
}
