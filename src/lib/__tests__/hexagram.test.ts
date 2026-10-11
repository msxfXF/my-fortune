import { describe, expect, it } from 'vitest';
import { HEXAGRAMS, changeLines, hexagramByLines, huGua, najia, palaceOf, sixGods } from '../hexagram';

const byName = (n: string) => HEXAGRAMS.find((h) => h.name === n)!;

describe('六十四卦', () => {
  it('64 卦互不重复', () => {
    expect(new Set(HEXAGRAMS.map((h) => h.lines.join(''))).size).toBe(64);
  });

  it('卦全名', () => {
    expect(byName('乾').fullName).toBe('乾为天');
    expect(byName('屯').fullName).toBe('水雷屯');
    expect(byName('明夷').fullName).toBe('地火明夷');
  });

  it('八宫世应', () => {
    expect(palaceOf(byName('姤'))).toMatchObject({ kind: '一世', shi: 1, ying: 4 });
    expect(palaceOf(byName('姤')).palace.name).toBe('乾');
    expect(palaceOf(byName('晋'))).toMatchObject({ kind: '游魂', shi: 4 });
    expect(palaceOf(byName('大有'))).toMatchObject({ kind: '归魂', shi: 3 });
    expect(palaceOf(byName('师')).palace.name).toBe('坎');
    expect(palaceOf(byName('师')).kind).toBe('归魂');
    expect(palaceOf(byName('明夷')).palace.name).toBe('坎');
    expect(palaceOf(byName('节'))).toMatchObject({ kind: '一世' });
    for (const h of HEXAGRAMS) expect(palaceOf(h)).toBeTruthy();
  });

  it('纳甲六亲', () => {
    const q = najia(byName('乾'));
    expect(q.map((l) => l.branch).join('')).toBe('子寅辰午申戌');
    expect(q.map((l) => l.kin)).toEqual(['子孙', '妻财', '父母', '官鬼', '兄弟', '父母']);
  });

  it('互卦与变卦', () => {
    expect(huGua(byName('乾')).name).toBe('乾');
    expect(huGua(byName('泰')).name).toBe('归妹');
    expect(changeLines(byName('乾'), [0]).name).toBe('姤');
    expect(hexagramByLines([0, 0, 0, 0, 0, 0]).name).toBe('坤');
  });

  it('六神', () => {
    expect(sixGods('甲')[0]).toBe('青龙');
    expect(sixGods('己')[0]).toBe('螣蛇');
    expect(sixGods('壬')).toEqual(['玄武', '青龙', '朱雀', '勾陈', '螣蛇', '白虎']);
  });
});
