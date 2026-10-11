import type { LunarObj } from 'lunar-javascript';
import { ELEMENTS, STEMS, STEM_ELEMENT, BRANCH_ELEMENT, relation, type Element } from './calendar';

export interface Pillar {
  label: string;
  gan: string;
  zhi: string;
  ganShiShen: string;
  zhiShiShen: string[];
  hide: string[];
  nayin: string;
}

export type Strength = '身强' | '身弱' | '中和';

export interface BaziResult {
  pillars: Pillar[];
  dayMaster: string;
  dmElement: Element;
  counts: Record<Element, number>;
  weights: Record<Element, number>;
  supportRatio: number;
  strength: Strength;
  pattern: string;
  yong: Element;
  xi: Element;
  ji: Element;
  missing: Element[];
  yun: { ganZhi: string; startAge: number; startYear: number }[];
}

const yang = (stem: string) => STEMS.indexOf(stem as (typeof STEMS)[number]) % 2 === 0;

/** 以日干为“我”，求另一天干的十神 */
export function shiShen(day: string, other: string): string {
  const rel = relation(STEM_ELEMENT[day], STEM_ELEMENT[other]);
  const same = yang(day) === yang(other);
  switch (rel) {
    case '比和': return same ? '比肩' : '劫财';
    case '我生': return same ? '食神' : '伤官';
    case '我克': return same ? '偏财' : '正财';
    case '克我': return same ? '七杀' : '正官';
    case '生我': return same ? '偏印' : '正印';
  }
}

const zero = (): Record<Element, number> => ({ 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 });

/** 由某关系求对应五行：如 dm=木、'我生' → 火 */
function elementBy(dm: Element, rel: string): Element {
  return ELEMENTS.find((e) => relation(dm, e) === rel)!;
}

export function analyzeBazi(lunar: LunarObj, gender: 0 | 1): BaziResult {
  const ec = lunar.getEightChar();
  const pillars: Pillar[] = [
    { label: '年柱', gan: ec.getYearGan(), zhi: ec.getYearZhi(), ganShiShen: ec.getYearShiShenGan(), zhiShiShen: ec.getYearShiShenZhi(), hide: ec.getYearHideGan(), nayin: ec.getYearNaYin() },
    { label: '月柱', gan: ec.getMonthGan(), zhi: ec.getMonthZhi(), ganShiShen: ec.getMonthShiShenGan(), zhiShiShen: ec.getMonthShiShenZhi(), hide: ec.getMonthHideGan(), nayin: ec.getMonthNaYin() },
    { label: '日柱', gan: ec.getDayGan(), zhi: ec.getDayZhi(), ganShiShen: '日主', zhiShiShen: ec.getDayShiShenZhi(), hide: ec.getDayHideGan(), nayin: ec.getDayNaYin() },
    { label: '时柱', gan: ec.getTimeGan(), zhi: ec.getTimeZhi(), ganShiShen: ec.getTimeShiShenGan(), zhiShiShen: ec.getTimeShiShenZhi(), hide: ec.getTimeHideGan(), nayin: ec.getTimeNaYin() },
  ];
  const dayMaster = pillars[2].gan;
  const dm = STEM_ELEMENT[dayMaster];

  // 明见八字的五行个数
  const counts = zero();
  pillars.forEach((p) => {
    counts[STEM_ELEMENT[p.gan]]++;
    counts[BRANCH_ELEMENT[p.zhi]]++;
  });

  // 旺衰权重：天干 1；地支按藏干本气 1、中气 0.5、余气 0.3；月令加倍
  const weights = zero();
  let support = 0;
  let total = 0;
  pillars.forEach((p, i) => {
    if (i !== 2) {
      const e = STEM_ELEMENT[p.gan];
      weights[e] += 1;
    }
    const mult = i === 1 ? 2.2 : 1;
    p.hide.forEach((h, j) => {
      weights[STEM_ELEMENT[h]] += [1, 0.5, 0.3][j] * mult;
    });
  });
  ELEMENTS.forEach((e) => {
    total += weights[e];
    const r = relation(dm, e);
    if (r === '比和' || r === '生我') support += weights[e];
  });
  const supportRatio = support / total;
  const strength: Strength = supportRatio >= 0.5 ? '身强' : supportRatio < 0.36 ? '身弱' : '中和';

  const w = (rel: string) => weights[elementBy(dm, rel)];
  let yong: Element;
  let xi: Element;
  let ji: Element;
  if (strength === '身强') {
    if (w('比和') >= w('生我')) {
      yong = elementBy(dm, '克我');
      ji = elementBy(dm, '比和');
    } else {
      yong = elementBy(dm, '我克');
      ji = elementBy(dm, '生我');
    }
    xi = elementBy(dm, '我生');
  } else if (strength === '身弱') {
    const heavy = (['克我', '我生', '我克'] as const).reduce((a, b) => (w(b) > w(a) ? b : a));
    if (heavy === '我克') {
      yong = elementBy(dm, '比和');
      xi = elementBy(dm, '生我');
    } else {
      yong = elementBy(dm, '生我');
      xi = elementBy(dm, '比和');
    }
    ji = elementBy(dm, heavy);
  } else {
    const sorted = ELEMENTS.slice().sort((a, b) => weights[a] - weights[b]);
    yong = sorted[0];
    xi = ELEMENTS.find((e) => relation(e, yong) === '我生')!;
    ji = sorted[4];
  }

  const monthMain = pillars[1].hide[0];
  const ss = shiShen(dayMaster, monthMain);
  const pattern = ss === '比肩' ? '建禄格' : ss === '劫财' ? '月刃格' : `${ss}格`;

  const missing = ELEMENTS.filter((e) => counts[e] === 0);

  let yun: BaziResult['yun'] = [];
  try {
    yun = ec
      .getYun(gender)
      .getDaYun(9)
      .filter((d) => d.getGanZhi())
      .map((d) => ({ ganZhi: d.getGanZhi(), startAge: d.getStartAge(), startYear: d.getStartYear() }));
  } catch {
    yun = [];
  }

  return { pillars, dayMaster, dmElement: dm, counts, weights, supportRatio, strength, pattern, yong, xi, ji, missing, yun };
}
