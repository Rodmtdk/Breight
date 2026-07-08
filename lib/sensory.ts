"use client"

// Multi-sensory feedback engine: synchronized haptic vibrations + sound design.
// Each emotional context has its own vibration pattern and audio signature so
// that interactions in BREIGHT are felt, not just seen.

export type SensoryEvent =
  | "tap" // light UI tap
  | "send" // message sent — gentle upward chime
  | "receive" // message received — warm soft chime
  | "match" // it's a match — joyful ascending arpeggio + strong pulse
  | "support" // empathy/support action — long soothing pulse
  | "milestone" // connection milestone — celebratory swell
  | "mood" // mood shared — soft double pulse

const VIBRATION_PATTERNS: Record<SensoryEvent, number[]> = {
  tap: [10],
  send: [15],
  receive: [20, 40, 20],
  match: [40, 60, 40, 60, 120],
  support: [200],
  milestone: [60, 40, 60, 40, 160],
  mood: [30, 60, 30],
}

// Tone sequences: [frequency Hz, duration ms, delay ms]
const TONE_SEQUENCES: Record<SensoryEvent, Array<[number, number, number]>> = {
  tap: [[520, 40, 0]],
  send: [
    [440, 60, 0],
    [660, 90, 60],
  ],
  receive: [
    [523, 90, 0],
    [392, 130, 90],
  ],
  match: [
    [523, 100, 0],
    [659, 100, 100],
    [784, 100, 200],
    [1047, 220, 300],
  ],
  support: [[330, 400, 0]],
  milestone: [
    [523, 120, 0],
    [659, 120, 110],
    [784, 260, 220],
  ],
  mood: [
    [494, 80, 0],
    [587, 140, 100],
  ],
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioContext = new Ctx()
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {})
  }
  return audioContext
}

function playTone(frequency: number, durationMs: number, delayMs: number) {
  const ctx = getAudioContext()
  if (!ctx) return
  const startTime = ctx.currentTime + delayMs / 1000
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(frequency, startTime)
  // Gentle envelope: quick attack, soft release — warm, non-jarring
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(0.08, startTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + durationMs / 1000 + 0.05)
}

/**
 * Trigger a synchronized haptic + audio sensory event.
 * Falls back gracefully when APIs are unavailable.
 */
export function triggerSensory(event: SensoryEvent) {
  if (typeof window === "undefined") return
  // Haptics
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(VIBRATION_PATTERNS[event])
    } catch {
      // unsupported — silent fallback
    }
  }
  // Sound
  try {
    for (const [freq, dur, delay] of TONE_SEQUENCES[event]) {
      playTone(freq, dur, delay)
    }
  } catch {
    // unsupported — silent fallback
  }
}
