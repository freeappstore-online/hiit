/** Format seconds as M:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Format seconds as H:MM:SS when over an hour, else M:SS */
export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return formatTime(seconds);
}

/** Phase display label */
export function phaseLabel(phase: string): string {
  switch (phase) {
    case "warmup":
      return "WARM UP";
    case "work":
      return "WORK";
    case "rest":
      return "REST";
    case "cooldown":
      return "COOL DOWN";
    case "complete":
      return "COMPLETE";
    default:
      return phase.toUpperCase();
  }
}
