import { useSyncExternalStore } from 'react';
import type { Tone } from './tone';

export interface HistoryEntry {
  id: string;
  game: string;
  title: string;
  summary: string;
  tone: Tone;
  time: number;
}

interface State {
  history: HistoryEntry[];
  seals: Record<string, number>;
  checkins: string[];
  muted: boolean;
  zodiac: number | null;
}

const KEY = 'yunbuxuan:v1';
const MAX_HISTORY = 200;

function load(): State {
  const empty: State = { history: [], seals: {}, checkins: [], muted: false, zodiac: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式等场景下忽略存储失败 */
  }
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export const getState = () => state;

type SealListener = (game: string) => void;
const sealListeners = new Set<SealListener>();
export function onNewSeal(l: SealListener) {
  sealListeners.add(l);
  return () => {
    sealListeners.delete(l);
  };
}

/** 记录一次占卜结果；若为该玩法首次完成，点亮印章并广播 */
export function recordResult(entry: Omit<HistoryEntry, 'id' | 'time'>): boolean {
  const now = Date.now();
  const item: HistoryEntry = { ...entry, id: `${now}-${Math.random().toString(36).slice(2, 8)}`, time: now };
  const isNewSeal = !state.seals[entry.game];
  commit({
    ...state,
    history: [item, ...state.history].slice(0, MAX_HISTORY),
    seals: isNewSeal ? { ...state.seals, [entry.game]: now } : state.seals,
  });
  if (isNewSeal) sealListeners.forEach((l) => l(entry.game));
  return isNewSeal;
}

export function clearHistory() {
  commit({ ...state, history: [] });
}

export function setMuted(muted: boolean) {
  commit({ ...state, muted });
}

export function setZodiac(zodiac: number | null) {
  commit({ ...state, zodiac });
}

export function checkIn(dateKey: string) {
  if (state.checkins.includes(dateKey)) return;
  commit({ ...state, checkins: [...state.checkins, dateKey].slice(-400) });
}

export function dateKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 截至今天（含）的连续签到天数 */
export function streak(checkins: string[], today: Date = new Date()): number {
  const set = new Set(checkins);
  let n = 0;
  const d = new Date(today);
  while (set.has(dateKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
