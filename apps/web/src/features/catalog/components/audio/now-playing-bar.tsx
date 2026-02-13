import "./now-playing-bar.css";

type NowPlayingBarProps = {
  title: string;
  scholar: string;
  progressPercent?: number;
};

export function NowPlayingBar({ title, scholar, progressPercent = 34 }: NowPlayingBarProps) {
  return (
    <section className="container" aria-label="Now playing preview">
      <div className="identity" aria-hidden="true">
        <span className="art" />
      </div>
      <div className="copy">
        <p className="label">Now Playing</p>
        <p className="title">{title}</p>
        <p className="scholar">{scholar}</p>
      </div>
      <div className="controls" aria-hidden="true">
        <span className="control">|&lt;</span>
        <span className="dot">&gt;</span>
        <span className="control">&gt;|</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span className="meterFill" style={{ width: `${progressPercent}%` }} />
      </div>
    </section>
  );
}
