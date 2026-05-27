import type { WorkoutSummary } from "../lib/types";
import { formatDuration } from "../lib/format";

interface SummaryScreenProps {
  summary: WorkoutSummary;
  presetName: string;
  onDone: () => void;
  onRepeat: () => void;
}

export default function SummaryScreen({
  summary,
  presetName,
  onDone,
  onRepeat,
}: SummaryScreenProps) {
  const stats = [
    { label: "Total Time", value: formatDuration(summary.totalTime) },
    { label: "Work Time", value: formatDuration(summary.totalWorkTime) },
    { label: "Rest Time", value: formatDuration(summary.totalRestTime) },
    { label: "Rounds", value: String(summary.roundsCompleted) },
  ];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      {/* Checkmark */}
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "var(--phase-work)", opacity: 0.9 }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      </div>

      <h2 className="mb-1 text-2xl font-bold" style={{ color: "var(--ink)" }}>
        Workout Complete!
      </h2>
      <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
        {presetName}
      </p>

      {/* Stats grid */}
      <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              {stat.label}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: "var(--ink)" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onRepeat}
          className="w-full rounded-xl py-3.5 text-base font-bold text-white transition-transform active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          Repeat Workout
        </button>
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-xl py-3.5 text-base font-semibold transition-colors"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          Back to Setup
        </button>
      </div>
    </div>
  );
}
