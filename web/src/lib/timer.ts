import type { Phase, TimerState, WorkoutConfig, WorkoutSummary } from "./types";

export interface PhaseSegment {
  phase: Phase;
  duration: number;
  round: number; // 1-based, 0 for warmup/cooldown
}

/** Build an ordered list of every phase segment for this workout */
export function buildPhaseList(config: WorkoutConfig): PhaseSegment[] {
  const segments: PhaseSegment[] = [];

  if (config.warmUp > 0) {
    segments.push({ phase: "warmup", duration: config.warmUp, round: 0 });
  }

  for (let r = 1; r <= config.rounds; r++) {
    segments.push({ phase: "work", duration: config.workDuration, round: r });
    // Only add rest between rounds (not after last), and only if rest > 0
    if (r < config.rounds && config.restDuration > 0) {
      segments.push({ phase: "rest", duration: config.restDuration, round: r });
    }
  }

  if (config.coolDown > 0) {
    segments.push({ phase: "cooldown", duration: config.coolDown, round: 0 });
  }

  return segments;
}

/** Calculate total workout duration */
export function totalWorkoutDuration(config: WorkoutConfig): number {
  const segments = buildPhaseList(config);
  return segments.reduce((sum, s) => sum + s.duration, 0);
}

/** Get initial timer state */
export function initialTimerState(segments: PhaseSegment[]): TimerState {
  const first = segments[0];
  if (!first) {
    return {
      phase: "complete",
      currentRound: 0,
      timeRemaining: 0,
      totalElapsed: 0,
      isRunning: false,
    };
  }
  return {
    phase: first.phase,
    currentRound: first.phase === "work" || first.phase === "rest" ? first.round : 0,
    timeRemaining: first.duration,
    totalElapsed: 0,
    isRunning: false,
  };
}

/** Compute workout summary from config and rounds actually completed */
export function computeSummary(
  config: WorkoutConfig,
  totalElapsed: number,
  roundsCompleted: number,
): WorkoutSummary {
  const workTime = Math.min(roundsCompleted, config.rounds) * config.workDuration;
  const restRounds = Math.max(0, Math.min(roundsCompleted, config.rounds) - 1);
  const restTime = restRounds * config.restDuration;

  return {
    totalTime: totalElapsed,
    totalWorkTime: workTime,
    totalRestTime: restTime,
    roundsCompleted: Math.min(roundsCompleted, config.rounds),
  };
}
