"use client";

type ProgressBarWebProps = {
  progressPercent: number;
  onSeek?: (percent: number) => void;
};

export function ProgressBarWeb({ progressPercent, onSeek }: ProgressBarWebProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percent)));
  };

  return (
    <div
      onClick={handleClick}
      style={{
        height: 4,
        backgroundColor: "#e5e7eb",
        borderRadius: 2,
        cursor: onSeek ? "pointer" : "default",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progressPercent}%`,
          backgroundColor: "#2563eb",
          borderRadius: 2,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}
