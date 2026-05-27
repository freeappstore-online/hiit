import { useState, useCallback } from "react";
import type { WorkoutConfig, TimerState, WorkoutSummary } from "./lib/types";
import { BUILT_IN_PRESETS, getAllPresets } from "./lib/presets";
import { buildPhaseList, initialTimerState, computeSummary } from "./lib/timer";
import { saveWorkout } from "./lib/storage";
import { resumeAudioContext } from "./lib/audio";
import SetupScreen from "./components/SetupScreen";
import TimerScreen from "./components/TimerScreen";
import SummaryScreen from "./components/SummaryScreen";
import HistoryScreen from "./components/HistoryScreen";

type Screen = "setup" | "timer" | "summary" | "history";

export default function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [config, setConfig] = useState<WorkoutConfig>(BUILT_IN_PRESETS[0]!.config);
  const [activePresetName, setActivePresetName] = useState("Tabata");
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const segments = buildPhaseList(BUILT_IN_PRESETS[0]!.config);
    return initialTimerState(segments);
  });
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  function handleConfigChange(newConfig: WorkoutConfig) {
    setConfig(newConfig);
    // Detect which preset matches
    const match = getAllPresets().find(
      (p) =>
        p.config.workDuration === newConfig.workDuration &&
        p.config.restDuration === newConfig.restDuration &&
        p.config.rounds === newConfig.rounds &&
        p.config.warmUp === newConfig.warmUp &&
        p.config.coolDown === newConfig.coolDown,
    );
    setActivePresetName(match?.name ?? "Custom");
  }

  function handleStart() {
    resumeAudioContext();
    const segments = buildPhaseList(config);
    const state = initialTimerState(segments);
    state.isRunning = true;
    setTimerState(state);
    setScreen("timer");
  }

  const handleTimerStateChange = useCallback(
    (updater: TimerState | ((prev: TimerState) => TimerState)) => {
      setTimerState(updater);
    },
    [],
  );

  const handleComplete = useCallback(() => {
    setTimerState((prev) => {
      const s = computeSummary(config, prev.totalElapsed, config.rounds);
      setSummary(s);

      // Save to history
      saveWorkout({
        id: `workout-${Date.now()}`,
        date: new Date().toISOString(),
        presetName: activePresetName,
        config,
        totalTime: s.totalTime,
        totalWorkTime: s.totalWorkTime,
        totalRestTime: s.totalRestTime,
        roundsCompleted: s.roundsCompleted,
        completed: true,
      });

      setScreen("summary");

      return { ...prev, phase: "complete", isRunning: false };
    });
  }, [config, activePresetName]);

  const handleReset = useCallback(() => {
    // Don't go back to setup on reset — just reset the timer
  }, []);

  function handleBackToSetup() {
    const segments = buildPhaseList(config);
    setTimerState(initialTimerState(segments));
    setSummary(null);
    setScreen("setup");
  }

  function handleRepeat() {
    const segments = buildPhaseList(config);
    const state = initialTimerState(segments);
    state.isRunning = true;
    setTimerState(state);
    setSummary(null);
    setScreen("timer");
  }

  switch (screen) {
    case "setup":
      return (
        <SetupScreen
          config={config}
          onConfigChange={handleConfigChange}
          onStart={handleStart}
          onShowHistory={() => setScreen("history")}
        />
      );
    case "timer":
      return (
        <TimerScreen
          config={config}
          timerState={timerState}
          onTimerStateChange={handleTimerStateChange}
          onComplete={handleComplete}
          onReset={handleReset}
        />
      );
    case "summary":
      return summary ? (
        <SummaryScreen
          summary={summary}
          presetName={activePresetName}
          onDone={handleBackToSetup}
          onRepeat={handleRepeat}
        />
      ) : null;
    case "history":
      return <HistoryScreen onBack={() => setScreen("setup")} />;
  }
}
