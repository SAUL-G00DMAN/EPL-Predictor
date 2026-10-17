/**
 * Native Browser Web Audio API Sound Synthesizer
 * Zero external asset dependencies - generates studio-grade broadcast telemetry sounds.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMutedState = false;

// Initialize and unlock the AudioContext via direct user interaction
export async function initAudio(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;

  try {
    if (!audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;

      audioCtx = new AudioCtxClass();
      masterGain = audioCtx.createGain();
      // Calibrated to audible, crisp studio volume
      masterGain.gain.setValueAtTime(0.75, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  } catch (err) {
    console.warn("[SoundFx] AudioContext init failed:", err);
  }

  return audioCtx;
}

export function isAudioMuted(): boolean {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("sim_sound_muted");
      if (stored !== null) {
        isMutedState = stored === "true";
      }
    } catch {}
  }
  return isMutedState;
}

export function setAudioMuted(muted: boolean): void {
  isMutedState = muted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("sim_sound_muted", String(muted));
    } catch {}
  }
}

export function toggleAudioMuted(): boolean {
  const next = !isAudioMuted();
  setAudioMuted(next);
  return next;
}

let suspendTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoSuspend() {
  if (typeof window === "undefined") return;
  if (suspendTimeout) {
    clearTimeout(suspendTimeout);
  }
  suspendTimeout = setTimeout(() => {
    if (audioCtx && audioCtx.state === "running") {
      audioCtx.suspend().catch(() => {});
    }
  }, 1000);
}

function ensureAudioReady(): boolean {
  if (isAudioMuted()) return false;
  if (!audioCtx) {
    initAudio().catch(() => {});
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  scheduleAutoSuspend();
  return !!audioCtx && !!masterGain;
}

/**
 * 1. Mechanical Keycap Click (Launch button)
 * Rich dual-frequency pop (440Hz dropping to 120Hz with a clear attack).
 */
export function playMechanicalClick(): void {
  if (!ensureAudioReady() || !audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  // Primary tone (440Hz down to 120Hz)
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(440, now);
  osc1.frequency.exponentialRampToValueAtTime(120, now + 0.08);

  gain1.gain.setValueAtTime(0.65, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc1.connect(gain1);
  gain1.connect(masterGain);
  osc1.start(now);
  osc1.stop(now + 0.085);

  // Upper transient pop (880Hz down to 240Hz)
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(880, now);
  osc2.frequency.exponentialRampToValueAtTime(240, now + 0.04);

  gain2.gain.setValueAtTime(0.4, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(now);
  osc2.stop(now + 0.05);
}

/**
 * 2. Telemetry Odometer Ticks
 * Crisp typewriter/micro-ticks (1000Hz - 1600Hz, duration 25ms, volume 0.4).
 */
export function playOdometerTick(progressRatio = 0): void {
  if (!ensureAudioReady() || !audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const clampedRatio = Math.max(0, Math.min(1, progressRatio));

  // Ascending frequency from 1000Hz up to 1600Hz
  const freq = 1000 + clampedRatio * 600;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.025);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.028);
}

/**
 * 3. Lock-in Thud (Podium Reveal)
 * Satisfying cinematic bass boom + chime (150Hz decaying bass + 600Hz triangle shimmer, duration 350ms, volume 0.7).
 */
export function playLockInSound(): void {
  if (!ensureAudioReady() || !audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  // Layer 1: Bass boom (150Hz down to 40Hz)
  const bassOsc = audioCtx.createOscillator();
  const bassGain = audioCtx.createGain();
  bassOsc.type = "sine";
  bassOsc.frequency.setValueAtTime(150, now);
  bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

  bassGain.gain.setValueAtTime(0.7, now);
  bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  bassOsc.connect(bassGain);
  bassGain.connect(masterGain);
  bassOsc.start(now);
  bassOsc.stop(now + 0.36);

  // Layer 2: 600Hz triangle wave shimmer chime
  const chimeOsc = audioCtx.createOscillator();
  const chimeGain = audioCtx.createGain();
  chimeOsc.type = "triangle";
  chimeOsc.frequency.setValueAtTime(600, now);
  chimeOsc.frequency.exponentialRampToValueAtTime(420, now + 0.35);

  chimeGain.gain.setValueAtTime(0.35, now);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  chimeOsc.connect(chimeGain);
  chimeGain.connect(masterGain);
  chimeOsc.start(now);
  chimeOsc.stop(now + 0.36);
}

/**
 * 4. Digital Glass Unlock (Full Table Reveal)
 * Crisp, premium digital unlock interaction:
 * - Attack Layer: Delicate micro-snap (sharp sine transient at 1200Hz dropping to 800Hz within 15ms)
 * - Resonance Layer: Warm dual-tone chime (C5: ~523Hz, E5: ~659Hz) with smooth exponential decay over 180ms
 * - Volume: Cleanly calibrated around 0.35 - 0.45 (zero noise/hiss)
 */
export function playExploreUnlock(): void {
  if (!ensureAudioReady() || !audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  // 1. Attack Layer: Sharp high-definition micro-snap (1200Hz -> 800Hz in 15ms)
  const snapOsc = audioCtx.createOscillator();
  const snapGain = audioCtx.createGain();
  snapOsc.type = "sine";
  snapOsc.frequency.setValueAtTime(1200, now);
  snapOsc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

  snapGain.gain.setValueAtTime(0.42, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

  snapOsc.connect(snapGain);
  snapGain.connect(masterGain);
  snapOsc.start(now);
  snapOsc.stop(now + 0.018);

  // 2. Resonance Layer: Warm dual-tone chime (C5: 523.25Hz, E5: 659.25Hz)
  // Note 1 (C5)
  const c5Osc = audioCtx.createOscillator();
  const c5Gain = audioCtx.createGain();
  c5Osc.type = "sine";
  c5Osc.frequency.setValueAtTime(523.25, now);

  c5Gain.gain.setValueAtTime(0.4, now);
  c5Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  c5Osc.connect(c5Gain);
  c5Gain.connect(masterGain);
  c5Osc.start(now);
  c5Osc.stop(now + 0.19);

  // Note 2 (E5)
  const e5Osc = audioCtx.createOscillator();
  const e5Gain = audioCtx.createGain();
  e5Osc.type = "sine";
  e5Osc.frequency.setValueAtTime(659.25, now);

  e5Gain.gain.setValueAtTime(0.36, now);
  e5Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  e5Osc.connect(e5Gain);
  e5Gain.connect(masterGain);
  e5Osc.start(now);
  e5Osc.stop(now + 0.19);
}

// Backward compatibility alias
export const playExploreSwoosh = playExploreUnlock;

