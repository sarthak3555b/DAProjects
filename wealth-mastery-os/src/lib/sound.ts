"use client";

/**
 * Subtle, synthesized sound design using the Web Audio API — no asset files.
 * Sounds are gentle and only play when the user enables sound in settings.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

type Tone = { freq: number; dur: number; type?: OscillatorType; gain?: number; delay?: number };

function playTones(tones: Tone[]) {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  tones.forEach(({ freq, dur, type = "sine", gain = 0.06, delay = 0 }) => {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now + delay);
    g.gain.linearRampToValueAtTime(gain, now + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
    osc.connect(g).connect(audio.destination);
    osc.start(now + delay);
    osc.stop(now + delay + dur + 0.02);
  });
}

function enabled() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("wm-ui");
    if (!raw) return false;
    return JSON.parse(raw)?.state?.soundEnabled === true;
  } catch {
    return false;
  }
}

export const sfx = {
  hover: () => enabled() && playTones([{ freq: 880, dur: 0.06, gain: 0.02, type: "triangle" }]),
  click: () => enabled() && playTones([{ freq: 520, dur: 0.08, gain: 0.04 }]),
  complete: () =>
    enabled() &&
    playTones([
      { freq: 523, dur: 0.12 },
      { freq: 659, dur: 0.12, delay: 0.08 },
      { freq: 784, dur: 0.2, delay: 0.16 },
    ]),
  achievement: () =>
    enabled() &&
    playTones([
      { freq: 587, dur: 0.14 },
      { freq: 740, dur: 0.14, delay: 0.1 },
      { freq: 880, dur: 0.14, delay: 0.2 },
      { freq: 1175, dur: 0.3, delay: 0.3, gain: 0.05 },
    ]),
  notify: () => enabled() && playTones([{ freq: 660, dur: 0.1 }, { freq: 990, dur: 0.12, delay: 0.06 }]),
  transition: () => enabled() && playTones([{ freq: 420, dur: 0.12, gain: 0.02, type: "sine" }]),
};
