import { BRANCH_ELEMENT, relation, type Element } from './calendar';
import { HEXAGRAM_ROWS, type HexLevel } from '../data/hexagrams';
import type { Tone } from './tone';

/** 爻：1 = 阳，0 = 阴；数组均自下而上 */
export type Line = 0 | 1;

export interface Trigram {
  name: string;
  image: string;
  element: Element;
  lines: [Line, Line, Line];
  /** 先天八卦数：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8 */
  xiantian: number;
  symbol: string;
}

export const TRIGRAMS: Trigram[] = [
  { name: '乾', image: '天', element: '金', lines: [1, 1, 1], xiantian: 1, symbol: '☰' },
  { name: '兑', image: '泽', element: '金', lines: [1, 1, 0], xiantian: 2, symbol: '☱' },
  { name: '离', image: '火', element: '火', lines: [1, 0, 1], xiantian: 3, symbol: '☲' },
  { name: '震', image: '雷', element: '木', lines: [1, 0, 0], xiantian: 4, symbol: '☳' },
  { name: '巽', image: '风', element: '木', lines: [0, 1, 1], xiantian: 5, symbol: '☴' },
  { name: '坎', image: '水', element: '水', lines: [0, 1, 0], xiantian: 6, symbol: '☵' },
  { name: '艮', image: '山', element: '土', lines: [0, 0, 1], xiantian: 7, symbol: '☶' },
  { name: '坤', image: '地', element: '土', lines: [0, 0, 0], xiantian: 8, symbol: '☷' },
];

const TRIGRAM_BY_NAME = Object.fromEntries(TRIGRAMS.map((t) => [t.name, t]));
const key3 = (l: readonly number[]) => l.join('');
const TRIGRAM_BY_LINES = Object.fromEntries(TRIGRAMS.map((t) => [key3(t.lines), t]));

export function trigramByLines(lines: readonly number[]): Trigram {
  return TRIGRAM_BY_LINES[key3(lines)];
}

/** 先天数 1–8 取卦（余 0 作 8） */
export function trigramByNumber(n: number): Trigram {
  const r = ((n % 8) + 8) % 8 || 8;
  return TRIGRAMS[r - 1];
}

export function levelTone(level: HexLevel): Tone {
  return level === '凶' ? 'xiong' : level === '平' ? 'ping' : 'ji';
}

export interface Hexagram {
  num: number;
  name: string;
  fullName: string;
  upper: Trigram;
  lower: Trigram;
  lines: Line[];
  judgement: string;
  level: HexLevel;
  plain: string;
}

function fullName(name: string, upper: Trigram, lower: Trigram) {
  if (upper === lower) return `${name}为${upper.image}`;
  return `${upper.image}${lower.image}${name}`;
}

export const HEXAGRAMS: Hexagram[] = HEXAGRAM_ROWS.map(([num, name, up, low, judgement, level, plain]) => {
  const upper = TRIGRAM_BY_NAME[up];
  const lower = TRIGRAM_BY_NAME[low];
  return {
    num,
    name,
    fullName: fullName(name, upper, lower),
    upper,
    lower,
    lines: [...lower.lines, ...upper.lines] as Line[],
    judgement,
    level,
    plain,
  };
});

const HEX_BY_KEY = Object.fromEntries(HEXAGRAMS.map((h) => [h.lines.join(''), h]));

export function hexagramByLines(lines: readonly number[]): Hexagram {
  const h = HEX_BY_KEY[lines.join('')];
  if (!h) throw new Error(`unknown hexagram ${lines.join('')}`);
  return h;
}

export function hexagramByTrigrams(upper: Trigram, lower: Trigram): Hexagram {
  return hexagramByLines([...lower.lines, ...upper.lines]);
}

/** 互卦：取 2–4 爻为下卦、3–5 爻为上卦 */
export function huGua(h: Hexagram): Hexagram {
  const l = h.lines;
  return hexagramByLines([l[1], l[2], l[3], l[2], l[3], l[4]]);
}

/** 变卦：把指定爻位（0 起）阴阳互换 */
export function changeLines(h: Hexagram, moving: readonly number[]): Hexagram {
  const l = h.lines.slice();
  moving.forEach((i) => (l[i] = (1 - l[i]) as Line));
  return hexagramByLines(l);
}

/* ---------------- 京房八宫：定宫、世应 ---------------- */

export type PalaceKind = '本宫' | '一世' | '二世' | '三世' | '四世' | '五世' | '游魂' | '归魂';
export interface PalaceInfo {
  palace: Trigram;
  kind: PalaceKind;
  /** 世爻位置（1–6） */
  shi: number;
  /** 应爻位置（1–6） */
  ying: number;
}

const PALACE_TABLE: Record<string, PalaceInfo> = (() => {
  const table: Record<string, PalaceInfo> = {};
  const kinds: PalaceKind[] = ['本宫', '一世', '二世', '三世', '四世', '五世', '游魂', '归魂'];
  const shiOf = [6, 1, 2, 3, 4, 5, 4, 3];
  for (const p of TRIGRAMS) {
    let cur = [...p.lines, ...p.lines] as number[];
    const seq: number[][] = [cur.slice()];
    for (let i = 0; i < 5; i++) {
      cur[i] = 1 - cur[i];
      seq.push(cur.slice());
    }
    cur[3] = 1 - cur[3];
    seq.push(cur.slice());
    cur = [...p.lines, cur[3], cur[4], cur[5]];
    seq.push(cur.slice());
    seq.forEach((lines, idx) => {
      const shi = shiOf[idx];
      table[lines.join('')] = { palace: p, kind: kinds[idx], shi, ying: shi > 3 ? shi - 3 : shi + 3 };
    });
  }
  return table;
})();

export function palaceOf(h: Hexagram): PalaceInfo {
  return PALACE_TABLE[h.lines.join('')];
}

/* ---------------- 纳甲、六亲、六神 ---------------- */

/** 各卦内卦（初二三爻）与外卦（四五上爻）所纳天干地支 */
const NAJIA: Record<string, { inner: [string, string[]]; outer: [string, string[]] }> = {
  乾: { inner: ['甲', ['子', '寅', '辰']], outer: ['壬', ['午', '申', '戌']] },
  坤: { inner: ['乙', ['未', '巳', '卯']], outer: ['癸', ['丑', '亥', '酉']] },
  震: { inner: ['庚', ['子', '寅', '辰']], outer: ['庚', ['午', '申', '戌']] },
  巽: { inner: ['辛', ['丑', '亥', '酉']], outer: ['辛', ['未', '巳', '卯']] },
  坎: { inner: ['戊', ['寅', '辰', '午']], outer: ['戊', ['申', '戌', '子']] },
  离: { inner: ['己', ['卯', '丑', '亥']], outer: ['己', ['酉', '未', '巳']] },
  艮: { inner: ['丙', ['辰', '午', '申']], outer: ['丙', ['戌', '子', '寅']] },
  兑: { inner: ['丁', ['巳', '卯', '丑']], outer: ['丁', ['亥', '酉', '未']] },
};

export type Kin = '兄弟' | '子孙' | '妻财' | '官鬼' | '父母';
const KIN_BY_RELATION: Record<string, Kin> = { 比和: '兄弟', 我生: '子孙', 我克: '妻财', 克我: '官鬼', 生我: '父母' };

export interface NajiaLine {
  stem: string;
  branch: string;
  element: Element;
  kin: Kin;
}

export function najia(h: Hexagram, palace: Trigram = palaceOf(h).palace): NajiaLine[] {
  const inner = NAJIA[h.lower.name].inner;
  const outer = NAJIA[h.upper.name].outer;
  return [0, 1, 2, 3, 4, 5].map((i) => {
    const [stem, branches] = i < 3 ? inner : outer;
    const branch = branches[i % 3];
    const element = BRANCH_ELEMENT[branch];
    return { stem, branch, element, kin: KIN_BY_RELATION[relation(palace.element, element)] };
  });
}

export const SIX_GODS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'] as const;
const GOD_START: Record<string, number> = { 甲: 0, 乙: 0, 丙: 1, 丁: 1, 戊: 2, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };

/** 六神自初爻起排，按日干定起点 */
export function sixGods(dayStem: string): string[] {
  const s = GOD_START[dayStem] ?? 0;
  return [0, 1, 2, 3, 4, 5].map((i) => SIX_GODS[(s + i) % 6]);
}
