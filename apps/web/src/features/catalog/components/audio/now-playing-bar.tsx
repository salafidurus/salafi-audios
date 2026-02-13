import styles from "./now-playing-bar.module.css";

type NowPlayingBarProps = {
  title: string;
  scholar: string;
  progressPercent?: number;
};

export function NowPlayingBar({ title, scholar, progressPercent = 34 }: NowPlayingBarProps) {
  return (
    <section className={styles.bar} aria-label="Now playing preview">
      <div className={styles.left}>
        <div className={styles.art} aria-hidden="true" />
        <div className={styles.copy}>
          <p className={styles.kicker}>Now playing</p>
          <p className={styles.title}>{title}</p>
          <p className={styles.subtitle}>{scholar}</p>
        </div>
      </div>

      <div className={styles.center} aria-hidden="true">
        <div className={styles.controls}>
          <button type="button" className={styles.icon} aria-disabled="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18a1 1 0 0 1-1-1V7a1 1 0 0 1 1.6-.8l6 5a1 1 0 0 1 0 1.6l-6 5A1 1 0 0 1 11 18Z" />
              <path d="M6 6a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
          <button type="button" className={styles.play} aria-disabled="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button type="button" className={styles.icon} aria-disabled="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 18a1 1 0 0 1-1.6.8l-6-5a1 1 0 0 1 0-1.6l6-5A1 1 0 0 1 13 7v10Z" />
              <path d="M18 6a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>

        <div className={styles.progress}>
          <span className={styles.time}>12:04</span>
          <span className={styles.track}>
            <span className={styles.fill} style={{ width: `${progressPercent}%` }} />
          </span>
          <span className={styles.time}>45:20</span>
        </div>
      </div>

      <div className={styles.right} aria-hidden="true">
        <button type="button" className={styles.icon} aria-disabled="true" aria-label="Queue">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5A1 1 0 0 1 4 6Zm0 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm14.5-1.2a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1-1.4 1.4l-.5-.5V21a1 1 0 1 1-2 0v-2.1l-.5.5a1 1 0 0 1-1.4-1.4l1.2-1.2Z" />
          </svg>
        </button>
        <button type="button" className={styles.icon} aria-disabled="true" aria-label="Like">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
