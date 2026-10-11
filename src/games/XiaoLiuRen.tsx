import { useEffect, useMemo, useRef, useState } from 'react';
import BirthForm from '../components/BirthForm';
import GameShell from '../components/GameShell';
import ResultCard from '../components/ResultCard';
import { PALACES, xiaoLiuRen } from '../data/xiaoliuren';
import { BRANCHES, cnNumber, nowLunar, shichenIndex, toLunar, type BirthInput } from '../lib/calendar';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import './xiaoliuren.css';

type Phase = 'idle' | 'month' | 'day' | 'hour' | 'done';
const PHASE_LABEL: Record<Phase, string> = { idle: '静心默念', month: '月上起数', day: '月上起日', hour: '日上起时', done: '课成' };

function initialCustom(): BirthInput {
  const d = new Date();
  return { kind: 'solar', year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), shichen: shichenIndex(d.getHours()) };
}

export default function XiaoLiuRen() {
  const [mode, setMode] = useState<'now' | 'custom'>('now');
  const [calendar, setCalendar] = useState<'lunar' | 'solar'>('lunar');
  const [custom, setCustom] = useState<BirthInput>(initialCustom);
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [active, setActive] = useState(-1);
  const [counter, setCounter] = useState(0);
  const [trail, setTrail] = useState<number[]>([]);
  const timers = useRef<number[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const input = useMemo(() => {
    if (mode === 'now') {
      const d = new Date();
      const l = nowLunar(d);
      const s = shichenIndex(d.getHours());
      return calendar === 'lunar'
        ? { month: Math.abs(l.getMonth()), day: l.getDay(), shichen: s, label: `农历${l.getMonthInChinese()}月${l.getDayInChinese()} · ${BRANCHES[s - 1]}时` }
        : { month: d.getMonth() + 1, day: d.getDate(), shichen: s, label: `公历${d.getMonth() + 1}月${d.getDate()}日 · ${BRANCHES[s - 1]}时` };
    }
    if (custom.kind === 'lunar') {
      return { month: Math.abs(custom.month), day: custom.day, shichen: custom.shichen, label: `农历${cnNumber(Math.abs(custom.month))}月${custom.day}日 · ${BRANCHES[custom.shichen - 1]}时` };
    }
    if (calendar === 'lunar') {
      const l = toLunar(custom);
      return { month: Math.abs(l.getMonth()), day: l.getDay(), shichen: custom.shichen, label: `农历${l.getMonthInChinese()}月${l.getDayInChinese()} · ${BRANCHES[custom.shichen - 1]}时` };
    }
    return { month: custom.month, day: custom.day, shichen: custom.shichen, label: `公历${custom.month}月${custom.day}日 · ${BRANCHES[custom.shichen - 1]}时` };
  }, [mode, calendar, custom, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const preview = useMemo(() => ({ input, result: xiaoLiuRen(input.month, input.day, input.shichen) }), [input]);
  const [cast, setCast] = useState<typeof preview | null>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = () => {
    const { input, result } = preview;
    setCast(preview);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTrail([]);
    let t = 300;
    const plan: { phase: Phase; from: number; count: number; speed: number }[] = [
      { phase: 'month', from: 0, count: input.month, speed: 170 },
      { phase: 'day', from: result.first, count: input.day, speed: input.day > 15 ? 85 : 120 },
      { phase: 'hour', from: result.second, count: input.shichen, speed: 170 },
    ];
    plan.forEach((p) => {
      timers.current.push(window.setTimeout(() => setPhase(p.phase), t));
      for (let i = 0; i < p.count; i++) {
        const idx = (p.from + i) % 6;
        timers.current.push(
          window.setTimeout(() => {
            setActive(idx);
            setCounter(i + 1);
            sfx.tick();
          }, t),
        );
        t += p.speed;
      }
      timers.current.push(window.setTimeout(() => setTrail((tr) => [...tr, (p.from + p.count - 1) % 6]), t - p.speed));
      t += 520;
    });
    timers.current.push(
      window.setTimeout(() => {
        setPhase('done');
        sfx.chime();
        const palace = PALACES[result.third];
        recordResult({ game: 'xiaoliuren', title: `${palace.name} · ${palace.level}`, summary: `${input.label}${question ? ` · 问「${question}」` : ''}`, tone: palace.tone });
      }, t),
    );
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setPhase('idle');
    setActive(-1);
    setCounter(0);
    setTrail([]);
    setCast(null);
  };

  const { input: shownInput, result } = cast ?? preview;
  const running = phase !== 'idle' && phase !== 'done';
  const palace = PALACES[result.third];

  return (
    <GameShell id="xiaoliuren">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          {phase === 'idle' && (
            <>
              <div className="segmented">
                <button className={mode === 'now' ? 'active' : ''} onClick={() => setMode('now')}>此刻起课</button>
                <button className={mode === 'custom' ? 'active' : ''} onClick={() => setMode('custom')}>指定时间</button>
              </div>
              {mode === 'custom' && <BirthForm value={custom} onChange={setCustom} minYear={1950} maxYear={2060} />}
              {!(mode === 'custom' && custom.kind === 'lunar') && (
                <div className="segmented">
                  <button className={calendar === 'lunar' ? 'active' : ''} onClick={() => setCalendar('lunar')}>按农历月日</button>
                  <button className={calendar === 'solar' ? 'active' : ''} onClick={() => setCalendar('solar')}>按公历月日</button>
                </div>
              )}
              <input className="input" style={{ width: 'min(420px, 100%)', textAlign: 'center' }} placeholder="心中所问之事（可不填）" value={question} maxLength={30} onChange={(e) => setQuestion(e.target.value)} />
            </>
          )}

          <div className="xlr-board" data-phase={phase}>
            <svg className="xlr-ring" viewBox="-100 -100 200 200" aria-hidden>
              <circle r="78" fill="none" stroke="rgba(232,194,122,.25)" strokeDasharray="1 4" />
              <circle r="92" fill="none" stroke="rgba(232,194,122,.12)" />
              <polygon
                points={PALACES.map((_, i) => {
                  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
                  return `${Math.cos(a) * 78},${Math.sin(a) * 78}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(232,194,122,.18)"
              />
            </svg>
            {PALACES.map((p, i) => {
              const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
              const final = phase === 'done' && i === result.third;
              return (
                <div
                  key={p.name}
                  className={`xlr-palace tone-${p.tone}${active === i ? ' active' : ''}${trail.includes(i) ? ' marked' : ''}${final ? ' final' : ''}`}
                  style={{ left: `${50 + Math.cos(a) * 39}%`, top: `${50 + Math.sin(a) * 39}%` }}
                >
                  <span className="xlr-name">{p.name}</span>
                  <span className="xlr-god">{p.god}</span>
                </div>
              );
            })}
            <div className="xlr-center">
              <div className="xlr-phase">{PHASE_LABEL[phase]}</div>
              <div className="xlr-count calligraphy">{phase === 'idle' ? '卜' : phase === 'done' ? palace.name : counter}</div>
              <div className="xlr-meta">{shownInput.label}</div>
            </div>
          </div>

          {phase === 'idle' && (
            <button className="btn btn-primary btn-lg" onClick={start}>
              掐指起课
            </button>
          )}
          {running && <div className="hint">从「大安」起，月 {shownInput.month}、日 {shownInput.day}、时辰序 {shownInput.shichen} 依次报数…</div>}
          <div className="rule-note">
            起课口诀：月上起日，日上起时。公式 <code>((月-1)+(日-1)+(时辰序-1)) mod 6</code>
            <br />
            时辰按两小时一辰简化换算（23:00–00:59 为子时，序 1）。
          </div>
        </div>
      </div>

      {phase === 'done' && (
        <ResultCard
          tone={palace.tone}
          kicker={`小六壬 · ${palace.god} · ${palace.direction} · 五行属${palace.element}`}
          title={palace.name}
          subtitle={`${shownInput.label}${question ? ` · 所问：${question}` : ''}`}
          badge={{ text: palace.level }}
          poem={palace.poem}
          onReplay={reset}
        >
          <div className="rc-plain">{palace.plain}</div>
          <h4>分事细断</h4>
          <div className="aspect-grid">
            {palace.aspects.map((a) => (
              <div className="aspect" key={a.label}>
                <b>{a.label}</b>
                {a.text}
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}
