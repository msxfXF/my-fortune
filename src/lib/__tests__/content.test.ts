import { describe, expect, it } from 'vitest';
import { GUANYIN } from '../../data/guanyin';
import { GUANDI } from '../../data/guandi';
import { TAROT } from '../../data/tarot';

const han = (s: string) => s.replace(/[，。、！？\s]/g, '');

describe('签诗格式', () => {
  for (const [name, lib] of [['观音', GUANYIN], ['关帝', GUANDI]] as const) {
    it(`${name}灵签 60 签，每签四句七言`, () => {
      expect(lib).toHaveLength(60);
      for (const lot of lib) {
        expect(lot.poem, `${name}第${lot.no}签`).toHaveLength(4);
        lot.poem.forEach((l) => expect(han(l).length, `${name}第${lot.no}签「${l}」`).toBe(7));
        expect(['上上', '上吉', '中吉', '中平', '下下']).toContain(lot.level);
        expect(lot.interp.length).toBeGreaterThan(8);
      }
    });
  }

  it('塔罗 22 张，正逆判词均为七言两句', () => {
    expect(TAROT).toHaveLength(22);
    for (const c of TAROT) {
      for (const r of [c.upright, c.reversed]) {
        r.verse.forEach((l) => expect(han(l).length, `${c.name}「${l}」`).toBe(7));
      }
    }
  });
});
