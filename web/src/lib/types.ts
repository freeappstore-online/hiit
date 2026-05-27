export interface WorkoutConfig {
  workDuration: number; // seconds (10-120)
  restDuration: number; // seconds (5-60)
  rounds: number; // 1-50
  warmUp: number; // seconds (0-60)
  coolDown: number; // seconds (0-60)
}

export interface Preset {
  id: string;
  name: string;
  config: WorkoutConfig;
  isCustom?: boolean;
}

export type Phase = "warmup" | "work" | "rest" | "cooldown" | "complete";

export interface TimerState {
  phase: Phase;
  currentRound: number;
  timeRemaining: number; // seconds remaining in current phase
  totalElapsed: number; // total seconds elapsed
  isRunning: boolean;
}

export interface WorkoutRecord {
  id: string;
  date: string; // ISO string
  presetName: string;
  config: WorkoutConfig;
  totalTime: number; // seconds
  totalWorkTime: number;
  totalRestTime: number;
  roundsCompleted: number;
  completed: boolean;
}

export interface WorkoutSummary {
  totalTime: number;
  totalWorkTime: number;
  totalRestTime: number;
  roundsCompleted: number;
}
