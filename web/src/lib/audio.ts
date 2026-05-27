let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

/** Short tick for 3-2-1 countdown */
export function playCountdownBeep(): void {
  playTone(880, 0.1, "sine");
}

/** Work phase start tone */
export function playWorkStart(): void {
  playTone(1047, 0.3, "square");
}

/** Rest phase start tone */
export function playRestStart(): void {
  playTone(523, 0.3, "sine");
}

/** Phase change long beep */
export function playPhaseChange(): void {
  playTone(660, 0.5, "sine");
}

/** Double beep for workout complete */
export function playWorkoutComplete(): void {
  playTone(1047, 0.2, "square");
  setTimeout(() => playTone(1319, 0.4, "square"), 250);
}

/** Resume audio context after user gesture (needed for mobile) */
export function resumeAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
  } catch {
    // Audio not available
  }
}
