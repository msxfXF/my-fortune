import { useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import ResultCard from '../components/ResultCard';
import { GRID_LAYOUT, GRID_LINES, NUMBER_MEANING, birthdayNumber, expressionNumber, lifePath } from '../data/numerology';
import { validSolarDate } from '../lib/calendar';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import './numerology.css';

type Stage = 'input' | 'orbit' | 'merge' | 'reduce' | 'done';

function StarPolygon({ n, size = 260 }: { n: number; size?: number }) {
  const v = n <= 9 ? Math.max(n, 3) : n === 33 ? 12 : 11;
  const step = v >= 5 ? Math.floor((v - 1) / 2) : 1;
  const r = size * 0.42;
  const pts: string[] = [];
  let i = 0;
  const seen = new Set<number>();
  for (let k = 0; k <= v * step; k++) {
    const a = (i / v) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
    seen.add(i);
    i = (i + step) % v;
    if (i === 0 && k > 0) break;
  }
  pts.push(pts[0]);
  const poly = Array.from({ length: v }, (_, j) => {
    const a = (j / v) * Math.PI * 2 - Math.PI / 2;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  });
  return (
    <svg className="nm-star" viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}>
      <circle r={r} className="nm-orbit" />
      <circle r={r * 0.62} className="nm-orbit dim" />
      <polygon points={poly.join(' ')} className="nm-poly" />
      <polyline points={pts.join(' ')} className="nm-starline" />
      {poly.map((p, j) => {
        const [x, y] = p.split(',').map(Number);
        return <circle key={j} cx={x} cy={y} r={3.2} className="nm-node" style={{ animationDelay: `${j * 0.08}s` }} />;
      })}
    </svg>
  );
}

export default function Numerology() {
  const [date, setDate] = useState('1995-08-17');
  const [name, setName] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [sumShown, setSumShown] = useState(0);
  const [stepShown, setStepShown] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const parsed = useMemo(() => {
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const [y, mo, d] = [+m[1], +m[2], +m[3]];
    if (!validSolarDate(y, mo, d)) return null;
    const lp = lifePath(y, mo, d);
    const bd = birthdayNumber(d);
    const ex = expressionNumber(name);
    const gridDigits = [...lp.digits, ...String(lp.sum).split('').map(Number), ...String(lp.result).split('').map(Number)].filter((x) => x > 0);
    const counts: Record<number, number> = {};
    gridDigits.forEach((x) => (counts[x] = (counts[x] ?? 0) + 1));
    const lines = GRID_LINES.filter((l) => l.nums.every((n) => counts[n]));
    return { y, mo, d, lp, bd, ex, counts, lines };
  }, [date, name]);

  const start = () => {
    if (!parsed) return;
    setStage('orbit');
    setSumShown(0);
    setStepShown(0);
    parsed.lp.digits.forEach((_, i) => later(() => sfx.tick(), 150 + i * 110));
    later(() => {
      setStage('merge');
      sfx.whoosh();
      const target = parsed.lp.sum;
      for (let k = 1; k <= 12; k++) later(() => setSumShown(Math.round((target * k) / 12)), k * 55);
    }, 1300);
    later(() => setStage('reduce'), 2300);
    parsed.lp.steps.slice(1).forEach((_, i) =>
      later(() => {
        setStepShown(i + 1);
        sfx.tick();
      }, 2700 + i * 600),
    );
    later(
      () => {
        setStage('done');
        sfx.chime();
        const m = NUMBER_MEANING[parsed.lp.result];
        recordResult({ game: 'numerology', title: `生命灵数 ${parsed.lp.result} · ${m.title}`, summary: m.keywords, tone: 'ji' });
      },
      2900 + parsed.lp.steps.length * 600,
    );
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage('input');
  };

  const digits = parsed?.lp.digits ?? [];
  const meaning = parsed ? NUMBER_MEANING[parsed.lp.result] : null;

  return (
    <GameShell id="numerology">
      <div className="panel stage panel-corners fade-up nm-theme">
        <div className="stage-center">
          {stage === 'input' && (
            <div className="form-row" style={{ justifyContent: 'center' }}>
              <label className="field" style={{ flex: '0 1 200px' }}>
                公历生日
                <input className="input" type="date" value={date} min="1900-01-01" max="2099-12-31" onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="field" style={{ flex: '0 1 240px' }}>
                英文名或拼音（可选，算命运数）
                <input className="input" placeholder="如 Li Ming" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
              </label>
            </div>
          )}

          <div className={`nm-stage s-${stage}`}>
            <div className="nm-rings">
              <div className="nm-ring r1" />
              <div className="nm-ring r2" />
              <div className="nm-ring r3" />
            </div>
            {stage !== 'input' &&
              digits.map((d, i) => {
                const a = (i / digits.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <span key={i} className="nm-digit" style={{ '--x': `${Math.cos(a) * 42}%`, '--y': `${Math.sin(a) * 42}%`, '--i': i } as React.CSSProperties}>
                    {d}
                  </span>
                );
              })}
            {stage === 'input' && <div className="nm-idle calligraphy">数</div>}
            {(stage === 'merge' || stage === 'reduce') && (
              <div className="nm-center">
                <div className="nm-sum">{sumShown}</div>
                {stage === 'reduce' && parsed && (
                  <div className="nm-steps">
                    {parsed.lp.steps.slice(1, stepShown + 1).map((s, i) => (
                      <span key={i}>→ {s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {stage === 'done' && parsed && (
              <div className="nm-final">
                <StarPolygon n={parsed.lp.result} />
                <div className="nm-final-num">{parsed.lp.result}</div>
              </div>
            )}
          </div>

          {stage === 'input' && (
            <button className="btn btn-primary btn-lg" disabled={!parsed} onClick={start}>
              推演灵数
            </button>
          )}
          <div className="rule-note">生日各位数字相加，反复相加至个位数；11、22、33 为大师数，保留不再相加。</div>
        </div>
      </div>

      {stage === 'done' && parsed && meaning && (
        <ResultCard
          tone="ji"
          kicker={`生命灵数 · ${parsed.y}.${parsed.mo}.${parsed.d}`}
          title={`${parsed.lp.result} · ${meaning.title}`}
          subtitle={meaning.keywords}
          badge={{ text: String(parsed.lp.result), small: '生命数' }}
          onReplay={reset}
          replayLabel="换个生日"
        >
          <div className="rc-plain">
            {parsed.lp.digits.join(' + ')} = {parsed.lp.steps.join(' → ')}
          </div>
          <h4>性格本质</h4>
          <div className="rc-plain">{meaning.nature}</div>
          <div className="aspect-grid" style={{ marginTop: 10 }}>
            <div className="aspect">
              <b>天赋优势</b>
              {meaning.strength}
            </div>
            <div className="aspect">
              <b>人生课题</b>
              {meaning.challenge}
            </div>
            <div className="aspect">
              <b>能量色彩</b>
              {meaning.color}
            </div>
          </div>

          <h4>衍生数字</h4>
          <div className="aspect-grid">
            <div className="aspect">
              <b>生日数 · {parsed.bd}</b>
              {NUMBER_MEANING[parsed.bd].title}：{NUMBER_MEANING[parsed.bd].strength}
            </div>
            {parsed.ex ? (
              <div className="aspect">
                <b>命运数 · {parsed.ex.result}</b>
                由「{name.trim()}」字母换算：{NUMBER_MEANING[parsed.ex.result].title}，{NUMBER_MEANING[parsed.ex.result].keywords}。
              </div>
            ) : (
              <div className="aspect">
                <b>命运数</b>填写英文名或拼音即可计算。
              </div>
            )}
          </div>

          <h4>九宫连线</h4>
          <div className="nm-grid-wrap">
            <div className="nm-grid">
              {GRID_LAYOUT.flat().map((n) => (
                <div key={n} className={`nm-cell${parsed.counts[n] ? ' on' : ''}`}>
                  <span className="nm-cell-n">{n}</span>
                  {parsed.counts[n] ? <span className="nm-cell-c">{'●'.repeat(Math.min(parsed.counts[n], 4))}</span> : null}
                </div>
              ))}
            </div>
            <div className="nm-lines">
              {parsed.lines.length ? (
                parsed.lines.map((l) => (
                  <div key={l.name} className="aspect">
                    <b>
                      {l.name} · {l.nums.join('-')}
                    </b>
                    {l.desc}
                  </div>
                ))
              ) : (
                <div className="muted">九宫中暂无完整连线，个性更为多元，可在后天中培养。</div>
              )}
            </div>
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}
