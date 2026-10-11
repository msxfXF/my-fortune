import { useEffect, useRef, useState } from 'react';
import BirthForm from '../components/BirthForm';
import GameShell from '../components/GameShell';
import ResultCard from '../components/ResultCard';
import { BONE_VERSES, DAY_WEIGHT, HOUR_WEIGHT, MONTH_WEIGHT, YEAR_WEIGHT, boneTone, formatWeight } from '../data/chenggu';
import { BRANCHES, toLunar, type BirthInput } from '../lib/calendar';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import './chenggu.css';

interface Weigh {
  parts: { label: string; key: string; qian: number }[];
  total: number;
  lunarText: string;
}

const MIN = 20;
const MAX = 72;

function Steelyard({ pos, angle, bag }: { pos: number; angle: number; bag: number }) {
  const x = 120 + ((pos - MIN) / (MAX - MIN)) * 520;
  return (
    <svg className="cg-svg" viewBox="0 0 720 360">
      <defs>
        <linearGradient id="cg-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d9a2" />
          <stop offset=".5" stopColor="#b98a44" />
          <stop offset="1" stopColor="#6e4818" />
        </linearGradient>
        <radialGradient id="cg-weight" cx=".35" cy=".3">
          <stop offset="0" stopColor="#d6c7a8" />
          <stop offset=".5" stopColor="#5e5340" />
          <stop offset="1" stopColor="#1f1a12" />
        </radialGradient>
      </defs>
      <line x1="80" y1="0" x2="80" y2="70" stroke="#c9a464" strokeWidth="2" />
      <g transform={`rotate(${angle} 80 90)`}>
        <rect x="20" y="84" width="660" height="12" rx="6" fill="url(#cg-beam)" />
        {Array.from({ length: MAX - MIN + 1 }).map((_, i) => {
          const q = MIN + i;
          const tx = 120 + (i / (MAX - MIN)) * 520;
          const major = q % 10 === 0;
          return (
            <g key={q}>
              <circle cx={tx} cy={90} r={major ? 2.4 : 1.2} fill={major ? '#2b1804' : '#4a2e0e'} />
              {major && (
                <text x={tx} y={78} textAnchor="middle" fontSize="15" fill="#e8c27a" fontFamily="var(--font-title)">
                  {'零一二三四五六七'[q / 10]}两
                </text>
              )}
            </g>
          );
        })}
        <circle cx="80" cy="90" r="7" fill="#e8c27a" stroke="#6e4818" strokeWidth="2" />
        <g>
          <line x1="40" y1="96" x2="40" y2="150" stroke="#c9a464" strokeWidth="1.6" />
          <path d="M40 150 q-10 8 0 16" stroke="#c9a464" strokeWidth="3" fill="none" />
          <g transform={`translate(40 ${170 + bag * 6})`}>
            <path d="M-34 0 h68 l-10 70 q-24 14 -48 0z" fill="#8f1f19" stroke="#e8c27a" strokeWidth="1.5" />
            <text x="0" y="48" textAnchor="middle" fill="#fbe9cf" fontSize="30" fontFamily="var(--font-title)">命</text>
          </g>
        </g>
        <g transform={`translate(${x} 96)`}>
          <line x1="0" y1="0" x2="0" y2="80" stroke="#c9a464" strokeWidth="1.6" />
          <rect x="-7" y="-6" width="14" height="10" rx="2" fill="#c9a464" />
          <path d="M-22 80 h44 l8 54 a30 12 0 0 1 -60 0z" fill="url(#cg-weight)" stroke="#e8c27a" strokeWidth="1" />
          <text x="0" y="120" textAnchor="middle" fill="#e8c27a" fontSize="16" fontFamily="var(--font-title)">砣</text>
        </g>
      </g>
    </svg>
  );
}

export default function ChengGu() {
  const [birth, setBirth] = useState<BirthInput>({ kind: 'lunar', year: 1990, month: 5, day: 15, shichen: 7 });
  const [weigh, setWeigh] = useState<Weigh | null>(null);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'input' | 'weighing' | 'done'>('input');
  const [shownParts, setShownParts] = useState(0);
  const [sim, setSim] = useState({ pos: MIN, angle: -14, bag: 0 });
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
    },
    [],
  );
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const start = () => {
    let l;
    try {
      l = toLunar(birth);
    } catch {
      setError('该日期不存在，请重新选择');
      return;
    }
    const yearGz = l.getYearInGanZhi();
    const m = Math.abs(l.getMonth());
    const d = l.getDay();
    const parts = [
      { label: `${yearGz}年`, key: '年', qian: YEAR_WEIGHT[yearGz] },
      { label: `${l.getMonthInChinese()}月`, key: '月', qian: MONTH_WEIGHT[m - 1] },
      { label: `${l.getDayInChinese()}日`, key: '日', qian: DAY_WEIGHT[d - 1] },
      { label: `${BRANCHES[birth.shichen - 1]}时`, key: '时', qian: HOUR_WEIGHT[birth.shichen - 1] },
    ];
    const total = parts.reduce((s, p) => s + p.qian, 0);
    const w: Weigh = { parts, total, lunarText: `农历${yearGz}年${l.getMonthInChinese()}月${l.getDayInChinese()} ${BRANCHES[birth.shichen - 1]}时` };
    setWeigh(w);
    setError('');
    setStage('weighing');
    setShownParts(0);
    parts.forEach((_, i) =>
      later(() => {
        setShownParts(i + 1);
        sfx.tick();
      }, 300 + i * 450),
    );

    // 秤砣滑动 + 秤杆阻尼摆动的简化物理
    const t0 = performance.now() + 2100;
    let pos = MIN;
    let vel = 0;
    let angle = -14;
    let av = 0;
    let lastClick = MIN;
    const loop = (now: number) => {
      if (now >= t0) {
        const k = 0.0009;
        vel += (total - pos) * k * 16 - vel * 0.12;
        pos += vel;
        const target = Math.max(-16, Math.min(16, (pos - total) * 0.9));
        av += (target - angle) * 0.08 - av * 0.14;
        angle += av;
        if (Math.abs(Math.round(pos) - lastClick) >= 3) {
          lastClick = Math.round(pos);
          sfx.tick();
        }
      }
      setSim({ pos, angle, bag: Math.sin(now / 300) * Math.min(1, Math.abs(av) * 2) });
      const settled = now > t0 + 6000 || (now > t0 + 600 && Math.abs(vel) < 0.01 && Math.abs(total - pos) < 0.05 && Math.abs(av) < 0.01 && Math.abs(angle) < 0.15);
      if (!settled) raf.current = requestAnimationFrame(loop);
      else {
        setSim({ pos: total, angle: 0, bag: 0 });
        setStage('done');
        sfx.chime();
        const v = BONE_VERSES[total];
        recordResult({ game: 'chenggu', title: `骨重${formatWeight(total)}`, summary: v ? v[2] : '', tone: boneTone(total).tone });
      }
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  };

  const reset = () => {
    cancelAnimationFrame(raf.current);
    timers.current.forEach(clearTimeout);
    setStage('input');
    setWeigh(null);
    setSim({ pos: MIN, angle: -14, bag: 0 });
  };

  const verse = weigh ? BONE_VERSES[weigh.total] : null;
  const level = weigh ? boneTone(weigh.total) : null;

  return (
    <GameShell id="chenggu">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          {stage === 'input' && (
            <>
              <BirthForm value={birth} onChange={setBirth} />
              <button className="btn btn-primary btn-lg" onClick={start}>
                上秤一称
              </button>
              {error && <div className="hint" style={{ color: 'var(--vermilion-hi)' }}>{error}</div>}
            </>
          )}
          <div className="cg-scale">
            <Steelyard pos={sim.pos} angle={sim.angle} bag={sim.bag} />
            {stage !== 'input' && (
              <div className="cg-reading">
                <span className="muted">秤星</span>
                <b className="calligraphy">{formatWeight(Math.max(MIN, Math.round(sim.pos)))}</b>
              </div>
            )}
          </div>
          {weigh && (
            <div className="cg-parts">
              {weigh.parts.map((p, i) => (
                <div key={p.key} className={`cg-part${i < shownParts ? ' on' : ''}`}>
                  <small>{p.key}</small>
                  <div>{p.label}</div>
                  <b>{formatWeight(p.qian)}</b>
                </div>
              ))}
              <div className={`cg-part total${stage === 'done' ? ' on' : ''}`}>
                <small>合</small>
                <div>骨重</div>
                <b>{formatWeight(weigh.total)}</b>
              </div>
            </div>
          )}
          <div className="rule-note">年按农历年干支（正月初一换年），月、日按农历，时按时辰；四者骨重相加，约在二两一至七两一之间。</div>
        </div>
      </div>

      {stage === 'done' && weigh && verse && level && (
        <ResultCard
          tone={level.tone}
          kicker={`称骨 · ${weigh.lunarText}`}
          title={`${formatWeight(weigh.total)}`}
          subtitle={`骨重 ${(weigh.total / 10).toFixed(1)} 两 · 命格「${level.level}」`}
          badge={{ text: level.level, small: '命格' }}
          poem={[verse[0], verse[1]]}
          onReplay={reset}
          replayLabel="再称一次"
        >
          <div className="rc-plain">{verse[2]}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            称骨法流传甚广而颇为简化，骨重轻重不定一生；批语为原创撰写，仅供娱乐。
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}
