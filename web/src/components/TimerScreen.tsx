import { useEffect, useRef, useCallback } from "react";
import type { WorkoutConfig, TimerState, Phase } from "../lib/types";
import type { PhaseSegment } from "../lib/timer";
import { buildPhaseList, initialTimerState, totalWorkoutDuration } from "../lib/timer";
import { formatTime, formatDuration, phaseLabel } from "../lib/format";
import {
  playCountdownBeep,
  playWorkStart,
  playRestStart,
  playPhaseChange,
  playWorkoutComplete,
  resumeAudioContext,
} from "../lib/audio";
import ProgressRing from "./ProgressRing";

type TimerStateUpdater = TimerState | ((prev: TimerState) => TimerState);

interface TimerScreenProps {
  config: WorkoutConfig;
  timerState: TimerState;
  onTimerStateChange: (updater: TimerStateUpdater) => void;
  onComplete: () => void;
  onReset: () => void;
}

function phaseColor(phase: Phase): string {
  switch (phase) {
    case "work":
      return "var(--phase-work)";
    case "rest":
      return "var(--phase-rest)";
    case "warmup":
    case "cooldown":
      return "var(--phase-warmup)";
    case "complete":
      return "var(--accent)";
  }
}

function phaseBg(phase: Phase): string {
  switch (phase) {
    case "work":
      return "rgba(22, 163, 74, 0.1)";
    case "rest":
      return "rgba(37, 99, 235, 0.1)";
    case "warmup":
    case "cooldown":
      return "rgba(217, 119, 6, 0.1)";
    case "complete":
      return "rgba(37, 99, 235, 0.1)";
  }
}

export default function TimerScreen({
  config,
  timerState,
  onTimerStateChange,
  onComplete,
  onReset,
}: TimerScreenProps) {
  const segmentsRef = useRef<PhaseSegment[]>(buildPhaseList(config));
  const segmentIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickAudioRef = useRef<number>(-1);

  // Rebuild segments when config changes
  useEffect(() => {
    segmentsRef.current = buildPhaseList(config);
    segmentIndexRef.current = 0;
  }, [config]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceToNextSegment = useCallback(
    (currentState: TimerState): TimerState => {
      const segments = segmentsRef.current;
      const nextIdx = segmentIndexRef.current + 1;

      if (nextIdx >= segments.length) {
        // Workout complete
        playWorkoutComplete();
        return {
          ...currentState,
          phase: "complete",
          timeRemaining: 0,
          isRunning: false,
        };
      }

      segmentIndexRef.current = nextIdx;
      const next = segments[nextIdx]!;

      // Play phase transition audio
      if (next.phase === "work") {
        playWorkStart();
      } else if (next.phase === "rest") {
        playRestStart();
      } else {
        playPhaseChange();
      }

      return {
        ...currentState,
        phase: next.phase,
        currentRound: next.phase === "work" || next.phase === "rest" ? next.round : currentState.currentRound,
        timeRemaining: next.duration,
      };
    },
    [],
  );

  const tick = useCallback(() => {
    onTimerStateChange((prev: TimerState) => {
      if (!prev.isRunning) return prev;

      const newRemaining = prev.timeRemaining - 1;
      const newElapsed = prev.totalElapsed + 1;

      // Countdown beeps at 3, 2, 1
      if (newRemaining > 0 && newRemaining <= 3 && lastTickAudioRef.current !== newRemaining) {
        lastTickAudioRef.current = newRemaining;
        playCountdownBeep();
      }

      if (newRemaining <= 0) {
        lastTickAudioRef.current = -1;
        const next = advanceToNextSegment({
          ...prev,
          timeRemaining: 0,
          totalElapsed: newElapsed,
        });
        if (next.phase === "complete") {
          stopInterval();
          onComplete();
        }
        return next;
      }

      return {
        ...prev,
        timeRemaining: newRemaining,
        totalElapsed: newElapsed,
      };
    });
  }, [advanceToNextSegment, onComplete, onTimerStateChange, stopInterval]);

  // Start/stop interval based on isRunning
  useEffect(() => {
    if (timerState.isRunning) {
      stopInterval();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [timerState.isRunning, tick, stopInterval]);

  function togglePause() {
    resumeAudioContext();
    onTimerStateChange((prev: TimerState) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  }

  function handleReset() {
    stopInterval();
    segmentIndexRef.current = 0;
    const segments = segmentsRef.current;
    onTimerStateChange(initialTimerState(segments));
    onReset();
  }

  function skipPhase() {
    if (timerState.phase === "complete") return;
    lastTickAudioRef.current = -1;
    const elapsed = timerState.totalElapsed + timerState.timeRemaining;
    const next = advanceToNextSegment({
      ...timerState,
      totalElapsed: elapsed,
    });
    if (next.phase === "complete") {
      stopInterval();
      onComplete();
    }
    onTimerStateChange(next);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          if (timerState.phase !== "complete") togglePause();
          break;
        case "r":
          handleReset();
          break;
        case "n":
          skipPhase();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState]);

  const currentSegment = segmentsRef.current[segmentIndexRef.current];
  const phaseDuration = currentSegment?.duration ?? 1;
  const phaseProgress = 1 - timerState.timeRemaining / phaseDuration;

  const totalDuration = totalWorkoutDuration(config);
  const overallProgress = totalDuration > 0 ? timerState.totalElapsed / totalDuration : 0;

  const color = phaseColor(timerState.phase);
  const bg = phaseBg(timerState.phase);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-4 transition-colors duration-500"
      style={{ background: bg }}
    >
      {/* Phase label */}
      <div
        className="mb-4 text-lg font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {phaseLabel(timerState.phase)}
      </div>

      {/* Main timer ring + countdown */}
      <ProgressRing
        progress={phaseProgress}
        color={color}
        size={Math.min(320, typeof window !== "undefined" ? window.innerWidth - 64 : 320)}
        strokeWidth={8}
      >
        <div
          className="text-7xl font-extrabold tabular-nums sm:text-8xl"
          style={{ color: "var(--ink)" }}
        >
          {formatTime(timerState.timeRemaining)}
        </div>
        {timerState.phase !== "complete" && (
          <div className="mt-1 text-sm font-medium" style={{ color: "var(--muted)" }}>
            Round {timerState.currentRound} / {config.rounds}
          </div>
        )}
      </ProgressRing>

      {/* Elapsed + overall progress */}
      <div className="mt-6 flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
        <span className="tabular-nums">{formatDuration(timerState.totalElapsed)} elapsed</span>
        <span>&middot;</span>
        <span className="tabular-nums">{Math.round(overallProgress * 100)}%</span>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={handleReset}
          className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold transition-colors"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
          title="Reset (R)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 10a7 7 0 0 1 12.45-4.33L14 7h5V2l-1.8 1.8A9 9 0 1 0 19 10h-2a7 7 0 0 1-14 0z"
              fill="currentColor"
              transform="translate(-0.5, 0)"
            />
          </svg>
        </button>

        {timerState.phase !== "complete" && (
          <button
            type="button"
            onClick={togglePause}
            className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white transition-transform active:scale-95"
            style={{ background: color }}
            title={timerState.isRunning ? "Pause (Space)" : "Start (Space)"}
          >
            {timerState.isRunning ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
        )}

        {timerState.phase !== "complete" && (
          <button
            type="button"
            onClick={skipPhase}
            className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold transition-colors"
            style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
            title="Skip phase (N)"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4l8 6-8 6V4zM14 4h2v12h-2V4z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
