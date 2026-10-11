import { describe, expect, it } from 'vitest';
import { xiaoLiuRen, PALACES } from '../../data/xiaoliuren';
import { lifePath, expressionNumber } from '../../data/numerology';
import { BONE_VERSES, DAY_WEIGHT, HOUR_WEIGHT, MONTH_WEIGHT, YEAR_WEIGHT, formatWeight } from '../../data/chenggu';
import { taiSuiRelations } from '../../data/zodiac';
import { shichenIndex, toLunar } from '../calendar';
import { analyzeBazi, shiShen } from '../bazi';

describe('小六壬', () => {
  it('闭式公式与三轮报数一致', () => {
    for (let m = 1; m <= 12; m++)
      for (let d = 1; d <= 30; d++)
        for (let h = 1; h <= 12; h++) expect(xiaoLiuRen(m, d, h).third).toBe((m - 1 + d - 1 + h - 1) % 6);
    expect(PALACES[xiaoLiuRen(1, 1, 1).third].name).toBe('大安');
  });
  it('时辰换算', () => {
    expect(shichenIndex(23)).toBe(1);
    expect(shichenIndex(0)).toBe(1);
    expect(shichenIndex(1)).toBe(2);
    expect(shichenIndex(12)).toBe(7);
    expect(shichenIndex(22)).toBe(12);
  });
});

describe('生命灵数', () => {
  it('保留大师数', () => {
    expect(lifePath(1995, 8, 17).result).toBe(4);
    expect(lifePath(1991, 11, 29).steps).toEqual([33]);
    expect(expressionNumber('Li Ming')?.result).toBe(1);
  });
});

describe('称骨', () => {
  it('表完整，批语覆盖全部可能骨重', () => {
    expect(Object.keys(YEAR_WEIGHT)).toHaveLength(60);
    const min = Math.min(...Object.values(YEAR_WEIGHT)) + Math.min(...MONTH_WEIGHT) + Math.min(...DAY_WEIGHT) + Math.min(...HOUR_WEIGHT);
    const max = Math.max(...Object.values(YEAR_WEIGHT)) + Math.max(...MONTH_WEIGHT) + Math.max(...DAY_WEIGHT) + Math.max(...HOUR_WEIGHT);
    for (let q = min; q <= max; q++) expect(BONE_VERSES[q], `骨重 ${q}`).toBeTruthy();
    expect(formatWeight(43)).toBe('四两三钱');
    expect(formatWeight(50)).toBe('五两');
  });
});

describe('生肖太岁', () => {
  it('合冲刑害', () => {
    expect(taiSuiRelations(0, 6)).toContain('冲太岁');
    expect(taiSuiRelations(4, 0)).toContain('三合');
    expect(taiSuiRelations(6, 7)).toContain('六合');
    expect(taiSuiRelations(6, 6)).toEqual(['值太岁', '刑太岁']);
    expect(taiSuiRelations(5, 8)).toEqual(expect.arrayContaining(['刑太岁', '破太岁', '六合']));
  });
});

describe('八字', () => {
  it('四柱与十神', () => {
    const r = analyzeBazi(toLunar({ kind: 'solar', year: 1995, month: 6, day: 15, shichen: 7 }), 1);
    expect(r.pillars.map((p) => p.gan + p.zhi).join(' ')).toBe('乙亥 壬午 丁丑 丙午');
    expect(shiShen('甲', '庚')).toBe('七杀');
    expect(shiShen('甲', '辛')).toBe('正官');
    expect(shiShen('丙', '戊')).toBe('食神');
  });
});
