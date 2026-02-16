import { ScholarDetailDto, ScholarStatsDto } from "@sd/api-client";
import styles from "./scholar-profile-header.module.css";

interface ScholarProfileHeaderProps {
  scholar: ScholarDetailDto;
  stats: ScholarStatsDto;
  isFollowing?: boolean;
  isAuthenticated?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
}

export function ScholarProfileHeader({
  scholar,
  stats,
  isFollowing = false,
  isAuthenticated = false,
  onFollow,
  onShare,
}: ScholarProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.mainContent}>
        {/* Avatar */}
        <div className={styles.avatarSection}>
          {scholar.imageUrl ? (
            <img src={scholar.imageUrl} alt={scholar.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>{scholar.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h1 className={styles.name}>{scholar.name}</h1>

          {scholar.country && (
            <div className={styles.titleBadge}>
              <span className={styles.badgeLabel}>Senior Scholar</span>
              <span className={styles.badgeSeparator}>•</span>
              <span className={styles.badgeValue}>{scholar.country}</span>
            </div>
          )}

          {scholar.bio && <p className={styles.bio}>{scholar.bio}</p>}

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{stats.seriesCount}</span>
              <span className={styles.statLabel}>Series</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{stats.lecturesCount}</span>
              <span className={styles.statLabel}>Lectures</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{formatFollowers(stats.followerCount)}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          <button
            className={`${styles.followButton} ${isFollowing ? styles.following : ""} ${!isAuthenticated ? styles.disabled : ""}`}
            onClick={onFollow}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Sign in to follow" : undefined}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>

          <button
            className={styles.shareButton}
            onClick={onShare}
            aria-label="Share scholar profile"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
}
