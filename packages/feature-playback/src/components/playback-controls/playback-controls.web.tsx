"use client";

type PlaybackControlsWebProps = {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onSkipNext?: () => void;
};

export function PlaybackControlsWeb({
  isPlaying,
  isLoading,
  onPlayPause,
  onSkipNext,
}: PlaybackControlsWebProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={onPlayPause}
        disabled={isLoading}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          border: "none",
          backgroundColor: "#2563eb",
          color: "#fff",
          cursor: isLoading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? "…" : isPlaying ? "❚❚" : "▶"}
      </button>

      {onSkipNext && (
        <button
          onClick={onSkipNext}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: "1px solid #d1d5db",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
          aria-label="Next track"
        >
          ⏭
        </button>
      )}
    </div>
  );
}
