import type { WorkoutRecord } from "./types";

const HISTORY_KEY = "hiit-workout-history";

export function getWorkoutHistory(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WorkoutRecord[];
  } catch {
    return [];
  }
}

export function saveWorkout(record: WorkoutRecord): void {
  const history = getWorkoutHistory();
  history.unshift(record);
  // Keep last 100 workouts
  if (history.length > 100) {
    history.length = 100;
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getStats(): {
  totalWorkouts: number;
  totalMinutes: number;
  favoritePreset: string;
} {
  const history = getWorkoutHistory();
  const totalWorkouts = history.length;
  const totalMinutes = Math.round(
    history.reduce((sum, w) => sum + w.totalTime, 0) / 60,
  );

  // Find most common preset
  const presetCounts: Record<string, number> = {};
  for (const w of history) {
    presetCounts[w.presetName] = (presetCounts[w.presetName] ?? 0) + 1;
  }
  let favoritePreset = "None";
  let maxCount = 0;
  for (const [name, count] of Object.entries(presetCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoritePreset = name;
    }
  }

  return { totalWorkouts, totalMinutes, favoritePreset };
}
