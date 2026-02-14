import styles from "./home-content-nav.module.css";

export function HomeContentNav() {
  return (
    <nav className={styles.contentNav} aria-label="Home content navigation">
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${styles.tabActive}`}
          aria-current="page"
          aria-disabled="true"
        >
          <span className={styles.tabIcon} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a1.5 1.5 0 0 1 1.06 0l7.5 2.73a1.5 1.5 0 0 1 .99 1.41v10.5a1.5 1.5 0 0 1-1.02 1.42l-7.5 2.58a1.5 1.5 0 0 1-.96 0l-7.5-2.58A1.5 1.5 0 0 1 3 18.48V7.98a1.5 1.5 0 0 1 .99-1.41l7.48-2.73Zm.53 2.24L6 8.35v8.76l6 2.06 6-2.06V8.35l-6-2.27Z" />
            </svg>
          </span>
          Home
        </button>

        <button type="button" className={styles.tab} aria-disabled="true">
          <span className={styles.tabIcon} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2a1 1 0 0 0-1 1v3.2l-2.1-1.05a1 1 0 0 0-1.34.45l-1.6 3.2a1 1 0 0 0 .45 1.34L10.2 11 7.4 12.2a1 1 0 0 0-.45 1.34l1.6 3.2a1 1 0 0 0 1.34.45L12 16.1V20a1 1 0 1 0 2 0v-3.9l2.1 1.1a1 1 0 0 0 1.34-.45l1.6-3.2a1 1 0 0 0-.45-1.34L15.8 11l2.8-1.1a1 1 0 0 0 .45-1.34l-1.6-3.2a1 1 0 0 0-1.34-.45L14 6.2V3a1 1 0 0 0-1-1Z" />
            </svg>
          </span>
          Latest
        </button>

        <button type="button" className={styles.tab} aria-disabled="true">
          <span className={styles.tabIcon} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 19a1 1 0 0 1-1-1v-5.2a1 1 0 0 1 2 0V17h16a1 1 0 1 1 0 2H4Zm4.5-7.2a1 1 0 0 1-.85-1.52l2.6-4.2a1 1 0 0 1 1.7 1.06l-2.6 4.2a1 1 0 0 1-.85.46Zm5.1 1.1a1 1 0 0 1-.8-1.6l4.1-5.5a1 1 0 0 1 1.6 1.2l-4.1 5.5a1 1 0 0 1-.8.4Z" />
            </svg>
          </span>
          Trending
        </button>

        <button type="button" className={styles.tab} aria-disabled="true">
          <span className={styles.tabIcon} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm0 2h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1 1 0 0 0 0 2h7a1 1 0 1 0 0-2h-7Zm0 4a1 1 0 0 0 0 2h7a1 1 0 1 0 0-2h-7Z" />
            </svg>
          </span>
          Series
        </button>
      </div>

      <button type="button" className={styles.viewAll} aria-disabled="true">
        View all
        <span className={styles.viewAllIcon} aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.75a.75.75 0 0 1 0 1.08l-5.5 5.75a.75.75 0 1 1-1.04-1.08l4.158-4.16H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
    </nav>
  );
}
