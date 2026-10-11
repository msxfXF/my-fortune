import { Lunar, Solar, type LunarObj } from 'lunar-javascript';

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const;
export const SHICHEN_RANGE = [
  '23:00–00:59', '01:00–02:59', '03:00–04:59', '05:00–06:59', '07:00–08:59', '09:00–10:59',
  '11:00–12:59', '13:00–14:59', '15:00–16:59', '17:00–18:59', '19:00–20:59', '21:00–22:59',
];

export type Element = '木' | '火' | '土' | '金' | '水';
export const ELEMENTS: Element[] = ['木', '火', '土', '金', '水'];

export const STEM_ELEMENT: Record<string, Element> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
export const BRANCH_ELEMENT: Record<string, Element> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

/** 五行相生：木→火→土→金→水→木 */
export const generates = (a: Element): Element => ELEMENTS[(ELEMENTS.indexOf(a) + 1) % 5];
/** 五行相克：木→土→水→火→金→木 */
export const controls = (a: Element): Element => ELEMENTS[(ELEMENTS.indexOf(a) + 2) % 5];

export type Relation = '比和' | '我生' | '生我' | '我克' | '克我';
/** a 相对 b 的关系（以 a 为主体） */
export function relation(a: Element, b: Element): Relation {
  if (a === b) return '比和';
  if (generates(a) === b) return '我生';
  if (generates(b) === a) return '生我';
  if (controls(a) === b) return '我克';
  return '克我';
}

/** 时辰序号 1–12（子=1 … 亥=12），按两小时一时辰简化换算 */
export function shichenIndex(hour: number): number {
  return (Math.floor((hour + 1) / 2) % 12) + 1;
}

/** 时辰中点小时，便于把“时辰”回填为具体时刻 */
export function shichenHour(index: number): number {
  return index === 1 ? 0 : (index - 1) * 2;
}

export type CalendarKind = 'solar' | 'lunar';

export interface BirthInput {
  kind: CalendarKind;
  year: number;
  month: number; // 农历闰月以负数表示
  day: number;
  shichen: number; // 1–12
}

/** 把输入（阳历或农历）统一换算为农历对象 */
export function toLunar(input: BirthInput): LunarObj {
  const hour = shichenHour(input.shichen);
  if (input.kind === 'solar') {
    return Solar.fromYmdHms(input.year, input.month, input.day, hour, 30, 0).getLunar();
  }
  return Lunar.fromYmdHms(input.year, input.month, input.day, hour, 30, 0);
}

export function nowLunar(d: Date = new Date()): LunarObj {
  return Solar.fromDate(d).getLunar();
}

export function lunarLabel(l: LunarObj): string {
  return `农历${l.getMonthInChinese()}月${l.getDayInChinese()}`;
}

const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export function cnNumber(n: number): string {
  if (n <= 10) return CN_NUM[n];
  if (n < 20) return '十' + CN_NUM[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return CN_NUM[t] + '十' + (u ? CN_NUM[u] : '');
}

export function validSolarDate(y: number, m: number, d: number): boolean {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}
