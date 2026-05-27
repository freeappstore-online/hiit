import type { Preset } from "./types";

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "tabata",
    name: "Tabata",
    config: {
      workDuration: 20,
      restDuration: 10,
      rounds: 8,
      warmUp: 0,
      coolDown: 0,
    },
  },
  {
    id: "emom",
    name: "EMOM",
    config: {
      workDuration: 60,
      restDuration: 0,
      rounds: 10,
      warmUp: 0,
      coolDown: 0,
    },
  },
  {
    id: "30-30",
    name: "30-30",
    config: {
      workDuration: 30,
      restDuration: 30,
      rounds: 10,
      warmUp: 0,
      coolDown: 0,
    },
  },
];

const CUSTOM_PRESETS_KEY = "hiit-custom-presets";

export function getCustomPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Preset[];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: Preset): void {
  const existing = getCustomPresets();
  const idx = existing.findIndex((p) => p.id === preset.id);
  if (idx >= 0) {
    existing[idx] = preset;
  } else {
    existing.push(preset);
  }
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(existing));
}

export function deleteCustomPreset(id: string): void {
  const existing = getCustomPresets().filter((p) => p.id !== id);
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(existing));
}

export function getAllPresets(): Preset[] {
  return [
    ...BUILT_IN_PRESETS,
    ...getCustomPresets().map((p) => ({ ...p, isCustom: true })),
  ];
}
