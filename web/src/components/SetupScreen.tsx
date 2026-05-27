import { useState } from "react";
import type { WorkoutConfig, Preset } from "../lib/types";
import { getAllPresets, saveCustomPreset, deleteCustomPreset } from "../lib/presets";
import { totalWorkoutDuration } from "../lib/timer";
import { formatDuration } from "../lib/format";
import NumberInput from "./NumberInput";

interface SetupScreenProps {
  config: WorkoutConfig;
  onConfigChange: (config: WorkoutConfig) => void;
  onStart: () => void;
  onShowHistory: () => void;
}

export default function SetupScreen({
  config,
  onConfigChange,
  onStart,
  onShowHistory,
}: SetupScreenProps) {
  const [activePresetId, setActivePresetId] = useState<string | null>("tabata");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const allPresets = getAllPresets();
  // Suppress unused warning - refreshKey forces re-read of custom presets
  void refreshKey;

  function selectPreset(preset: Preset) {
    setActivePresetId(preset.id);
    onConfigChange(preset.config);
  }

  function handleConfigChange(partial: Partial<WorkoutConfig>) {
    setActivePresetId(null);
    onConfigChange({ ...config, ...partial });
  }

  function handleSavePreset() {
    if (!presetName.trim()) return;
    const id = `custom-${Date.now()}`;
    const preset: Preset = {
      id,
      name: presetName.trim(),
      config: { ...config },
      isCustom: true,
    };
    saveCustomPreset(preset);
    setActivePresetId(id);
    setPresetName("");
    setSaveDialogOpen(false);
    setRefreshKey((k) => k + 1);
  }

  function handleDeletePreset(id: string) {
    deleteCustomPreset(id);
    if (activePresetId === id) {
      setActivePresetId(null);
    }
    setRefreshKey((k) => k + 1);
  }

  const total = totalWorkoutDuration(config);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
            HIIT Timer
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Configure your interval workout
          </p>
        </div>
        <button
          type="button"
          onClick={onShowHistory}
          className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          History
        </button>
      </div>

      {/* Presets */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Presets
        </h2>
        <div className="flex flex-wrap gap-2">
          {allPresets.map((preset) => (
            <div key={preset.id} className="relative">
              <button
                type="button"
                onClick={() => selectPreset(preset)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  background: activePresetId === preset.id ? "var(--accent)" : "var(--panel)",
                  color: activePresetId === preset.id ? "#fff" : "var(--ink)",
                  border: `1px solid ${activePresetId === preset.id ? "var(--accent)" : "var(--line)"}`,
                }}
              >
                {preset.name}
              </button>
              {preset.isCustom && (
                <button
                  type="button"
                  onClick={() => handleDeletePreset(preset.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs"
                  style={{ background: "var(--error)", color: "#fff" }}
                  title="Delete preset"
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setActivePresetId(null)}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: activePresetId === null ? "var(--accent)" : "var(--panel)",
              color: activePresetId === null ? "#fff" : "var(--ink)",
              border: `1px solid ${activePresetId === null ? "var(--accent)" : "var(--line)"}`,
            }}
          >
            Custom
          </button>
        </div>
      </section>

      {/* Configuration */}
      <section className="mb-6 grid grid-cols-2 gap-4">
        <NumberInput
          label="Work"
          value={config.workDuration}
          min={10}
          max={120}
          step={5}
          onChange={(v) => handleConfigChange({ workDuration: v })}
        />
        <NumberInput
          label="Rest"
          value={config.restDuration}
          min={0}
          max={60}
          step={5}
          onChange={(v) => handleConfigChange({ restDuration: v })}
        />
        <NumberInput
          label="Rounds"
          value={config.rounds}
          min={1}
          max={50}
          suffix=""
          onChange={(v) => handleConfigChange({ rounds: v })}
        />
        <NumberInput
          label="Warm Up"
          value={config.warmUp}
          min={0}
          max={60}
          step={5}
          onChange={(v) => handleConfigChange({ warmUp: v })}
        />
        <NumberInput
          label="Cool Down"
          value={config.coolDown}
          min={0}
          max={60}
          step={5}
          onChange={(v) => handleConfigChange({ coolDown: v })}
        />
        <div className="flex flex-col justify-end">
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <div className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              Total
            </div>
            <div className="text-xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              {formatDuration(total)}
            </div>
          </div>
        </div>
      </section>

      {/* Save as preset */}
      {!saveDialogOpen ? (
        <button
          type="button"
          onClick={() => setSaveDialogOpen(true)}
          className="mb-4 w-full rounded-lg py-2 text-sm font-medium transition-colors"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--muted)" }}
        >
          Save as Custom Preset
        </button>
      ) : (
        <div
          className="mb-4 flex gap-2 rounded-lg p-3"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSavePreset();
              if (e.key === "Escape") setSaveDialogOpen(false);
            }}
            placeholder="Preset name"
            className="flex-1 rounded-md px-3 py-2 text-sm"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              outline: "none",
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSavePreset}
            disabled={!presetName.trim()}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setSaveDialogOpen(false)}
            className="rounded-md px-3 py-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Start button */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-xl py-4 text-lg font-bold text-white transition-transform active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          Start Workout
        </button>
        <p className="mt-2 text-center text-xs" style={{ color: "var(--muted)" }}>
          Space to start/pause &middot; R to reset &middot; N to skip phase
        </p>
      </div>
    </div>
  );
}
