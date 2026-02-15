import Link from "next/link";
import styles from "./primary-audio-panel.module.css";

type PrimaryAudioPanelProps = {
  url: string;
};

export function PrimaryAudioPanel({ url }: PrimaryAudioPanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>Primary Audio</h2>
      <audio className={styles.player} controls preload="none" src={url}>
        Your browser does not support the audio element.
      </audio>
      <p className={styles.linkWrap}>
        <Link href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Open source file
        </Link>
      </p>
    </section>
  );
}
