import { useState } from "react";
import { getWorkoutHistory, getStats, clearHistory } from "../lib/storage";
import { formatDuration } from "../lib/format";

interface HistoryScreenProps {
  onBack: () => void;
}

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  // Suppress unused - refreshKey forces re-read
  void refreshKey;

  const history = getWorkoutHistory();
  const stats = getStats();

  function handleClear() {
    clearHistory();
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--ink)" }}>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
          History
        </h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <div className="text-2xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
            {stats.totalWorkouts}
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Workouts
          </div>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <div className="text-2xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
            {stats.totalMinutes}
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Minutes
          </div>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <div className="text-lg font-bold truncate px-1" style={{ color: "var(--accent)" }}>
            {stats.favoritePreset}
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Favorite
          </div>
        </div>
      </div>

      {/* Workout list */}
      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No workouts yet. Start your first one!
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {history.map((record) => {
              const date = new Date(record.date);
              const dateStr = date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeStr = date.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl p-3"
                  style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {record.presetName}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {dateStr} at {timeStr}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {record.config.workDuration}s work / {record.config.restDuration}s rest / {record.roundsCompleted} rounds
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums" style={{ color: "var(--ink)" }}>
                      {formatDuration(record.totalTime)}
                    </div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: record.completed ? "var(--success)" : "var(--warning)" }}
                    >
                      {record.completed ? "Completed" : "Partial"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="mt-6 w-full rounded-lg py-2 text-sm font-medium"
            style={{ color: "var(--error)", background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            Clear History
          </button>
        </>
      )}
    </div>
  );
}
