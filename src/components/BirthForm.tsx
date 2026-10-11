import { LunarMonth, LunarYear } from 'lunar-javascript';
import { useMemo } from 'react';
import { SHICHEN_RANGE, BRANCHES, cnNumber, type BirthInput } from '../lib/calendar';

interface Props {
  value: BirthInput;
  onChange: (v: BirthInput) => void;
  showShichen?: boolean;
  allowLunar?: boolean;
  gender?: 0 | 1;
  onGender?: (g: 0 | 1) => void;
  minYear?: number;
  maxYear?: number;
}

function daysIn(v: BirthInput): number {
  if (v.kind === 'solar') return new Date(v.year, v.month, 0).getDate();
  try {
    return LunarMonth.fromYm(v.year, v.month)?.getDayCount() ?? 30;
  } catch {
    return 30;
  }
}

/** 生辰输入：阳历 / 农历可切换，农历支持闰月 */
export default function BirthForm({ value, onChange, showShichen = true, allowLunar = true, gender, onGender, minYear = 1920, maxYear = 2050 }: Props) {
  const years = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i), [minYear, maxYear]);
  const months = useMemo(() => {
    const base = Array.from({ length: 12 }, (_, i) => ({ v: i + 1, label: value.kind === 'solar' ? `${i + 1} 月` : `${i === 0 ? '正' : i === 11 ? '腊' : cnNumber(i + 1)}月` }));
    if (value.kind === 'lunar') {
      const leap = LunarYear.fromYear(value.year).getLeapMonth();
      if (leap > 0) base.splice(leap, 0, { v: -leap, label: `闰${cnNumber(leap)}月` });
    }
    return base;
  }, [value.kind, value.year]);
  const dayCount = daysIn(value);

  const set = (patch: Partial<BirthInput>) => {
    const next = { ...value, ...patch };
    if (next.month < 0 && next.kind === 'lunar' && LunarYear.fromYear(next.year).getLeapMonth() !== -next.month) next.month = -next.month;
    if (next.kind === 'solar' && next.month < 0) next.month = -next.month;
    next.day = Math.min(next.day, daysIn(next));
    onChange(next);
  };

  return (
    <div className="birth-form">
      <div className="form-row" style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        {allowLunar && (
          <div className="segmented" role="tablist">
            <button className={value.kind === 'solar' ? 'active' : ''} onClick={() => set({ kind: 'solar' })}>阳历</button>
            <button className={value.kind === 'lunar' ? 'active' : ''} onClick={() => set({ kind: 'lunar' })}>农历</button>
          </div>
        )}
        {onGender && (
          <div className="segmented">
            <button className={gender === 1 ? 'active' : ''} onClick={() => onGender(1)}>乾造 · 男</button>
            <button className={gender === 0 ? 'active' : ''} onClick={() => onGender(0)}>坤造 · 女</button>
          </div>
        )}
      </div>
      <div className="form-row">
        <label className="field">
          年
          <select className="select" value={value.year} onChange={(e) => set({ year: Number(e.target.value) })}>
            {years.map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
        </label>
        <label className="field">
          月
          <select className="select" value={value.month} onChange={(e) => set({ month: Number(e.target.value) })}>
            {months.map((m) => (
              <option key={m.v} value={m.v}>{m.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          日
          <select className="select" value={value.day} onChange={(e) => set({ day: Number(e.target.value) })}>
            {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{value.kind === 'solar' ? `${d} 日` : d <= 10 ? `初${cnNumber(d)}` : d < 20 ? `十${cnNumber(d - 10)}` : d === 20 ? '二十' : d < 30 ? `廿${cnNumber(d - 20)}` : '三十'}</option>
            ))}
          </select>
        </label>
        {showShichen && (
          <label className="field" style={{ flexBasis: 170 }}>
            时辰
            <select className="select" value={value.shichen} onChange={(e) => set({ shichen: Number(e.target.value) })}>
              {BRANCHES.map((b, i) => (
                <option key={b} value={i + 1}>{b}时 · {SHICHEN_RANGE[i]}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
