import Link from "next/link";
import Image from "next/image";
import { ListVideo, Layers3, LibraryBig, Heart } from "lucide-react";
import styles from "./scholar-card.module.css";

const FALLBACK_IMAGE = "/dev-mock/template-4-to-5-image.jpg";

export type ScholarCardItem = {
  id: string;
  slug: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  isKibar: boolean;
  collectionsCount: number;
  standaloneSeriesCount: number;
  standaloneLecturesCount: number;
};

type ScholarCardProps = {
  scholar: ScholarCardItem;
  onFollowClick?: (scholarId: string) => void;
};

export function ScholarCard({ scholar, onFollowClick }: ScholarCardProps) {
  const subtitle = scholar.isKibar ? "SENIOR SALAFI SCHOLAR" : "SALAFI SCHOLAR";

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFollowClick?.(scholar.id);
  };

  return (
    <Link href={`/scholars/${scholar.slug}`} className={styles.card} role="listitem">
      <div className={styles.cover}>
        <Image
          src={scholar.imageUrl || FALLBACK_IMAGE}
          alt={scholar.name}
          fill
          className={styles.coverImage}
          sizes="(max-width: 640px) 280px, 376px"
        />
        <div className={styles.coverOverlay}>
          <div className={styles.contentTop}>
            <span className={styles.typeChip}>{subtitle}</span>
          </div>
          <div className={styles.contentBottom}>
            <h3 className={styles.name} title={scholar.name}>
              {scholar.name}
            </h3>
            <div className={styles.metaRow}>
              <div className={styles.counts}>
                <span className={styles.countItem}>
                  <ListVideo className={styles.countIcon} aria-hidden="true" />
                  <span>{scholar.standaloneLecturesCount}</span>
                </span>
                <span className={styles.countItem}>
                  <Layers3 className={styles.countIcon} aria-hidden="true" />
                  <span>{scholar.standaloneSeriesCount}</span>
                </span>
                <span className={styles.countItem}>
                  <LibraryBig className={styles.countIcon} aria-hidden="true" />
                  <span>{scholar.collectionsCount}</span>
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.followBtn}
                  onClick={handleFollowClick}
                  aria-label="Follow scholar"
                >
                  <Heart className={styles.followIcon} aria-hidden="true" />
                </button>
                <span className={styles.viewBtn}>View</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
