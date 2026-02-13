import Link from "next/link";

type PrimaryAudioPanelProps = {
  url: string;
};

export function PrimaryAudioPanel({ url }: PrimaryAudioPanelProps) {
  return (
    <section className="catalog-audio-panel">
      <h2 className="catalog-section-title">Primary Audio</h2>
      <audio className="catalog-audio-player" controls preload="none" src={url}>
        Your browser does not support the audio element.
      </audio>
      <p className="catalog-audio-link-wrap">
        <Link href={url} target="_blank" rel="noopener noreferrer" className="catalog-link-inline">
          Open source file
        </Link>
      </p>
    </section>
  );
}
