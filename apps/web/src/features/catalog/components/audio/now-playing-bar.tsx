type NowPlayingBarProps = {
  title: string;
  scholar: string;
  progressPercent?: number;
};

export function NowPlayingBar({ title, scholar, progressPercent = 34 }: NowPlayingBarProps) {
  return (
    <section className="home-now-playing" aria-label="Now playing preview">
      <div className="home-now-playing-identity" aria-hidden="true">
        <span className="home-now-playing-art" />
      </div>
      <div className="home-now-playing-copy">
        <p className="home-now-playing-label">Now Playing</p>
        <p className="home-now-playing-title">{title}</p>
        <p className="home-now-playing-scholar">{scholar}</p>
      </div>
      <div className="home-now-playing-controls" aria-hidden="true">
        <span className="home-now-playing-control">|&lt;</span>
        <span className="home-now-playing-dot">&gt;</span>
        <span className="home-now-playing-control">&gt;|</span>
      </div>
      <div className="home-now-playing-meter" aria-hidden="true">
        <span className="home-now-playing-meter-fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </section>
  );
}
