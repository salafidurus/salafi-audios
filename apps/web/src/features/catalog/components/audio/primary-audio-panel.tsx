import Link from "next/link";
import styles from "./primary-audio-panel.module.css";

type PrimaryAudioPanelProps = {
  url: string;
};

export function PrimaryAudioPanel({ url }: PrimaryAudioPanelProps) {
  return (
    <section className={styles["catalog-audio-panel"]}>
      <h2 className={styles["catalog-section-title"]}>Primary Audio</h2>
      <audio className={styles["catalog-audio-player"]} controls preload="none" src={url}>
        Your browser does not support the audio element.
      </audio>
      <p className={styles["catalog-audio-link-wrap"]}>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles["catalog-link-inline"]}
        >
          Open source file
        </Link>
      </p>
    </section>
  );
}
