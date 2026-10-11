import { getState } from './storage';

/** 以 WebAudio 合成的轻量音效，无需任何音频资源 */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (getState().muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(dur: number, gain: number, freq: number, delay = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 2;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  /** 轻触：报数跳宫、按钮 */
  tick: () => tone(1320, 0.06, 'triangle', 0.08),
  /** 签支碰撞（木质） */
  clack: () => {
    noise(0.05, 0.35, 1800 + Math.random() * 900);
    tone(700 + Math.random() * 300, 0.05, 'square', 0.03);
  },
  /** 铜钱落地 */
  coin: (delay = 0) => {
    tone(2600, 0.25, 'sine', 0.06, delay);
    tone(3900, 0.18, 'sine', 0.035, delay + 0.01);
    noise(0.04, 0.2, 5000, delay);
  },
  /** 风声（签飞出、翻牌） */
  whoosh: () => noise(0.35, 0.25, 900),
  /** 清磬：成卦、揭签 */
  chime: () => {
    [880, 1318.5, 1760].forEach((f, i) => tone(f, 1.6 - i * 0.3, 'sine', 0.07 / (i + 1), i * 0.02));
  },
  /** 钟鸣：印章 */
  gong: () => {
    tone(196, 2.2, 'sine', 0.18);
    tone(392.5, 1.6, 'sine', 0.06);
    tone(587, 1.0, 'triangle', 0.03);
    noise(0.12, 0.3, 300);
  },
  /** 翻纸 */
  paper: () => noise(0.25, 0.22, 2400),
};
