import { useEffect, useMemo, useRef, useState } from 'react';
import BirthForm from '../components/BirthForm';
import GameShell from '../components/GameShell';
import ResultCard from '../components/ResultCard';
import { DAY_MASTER, ELEMENT_COLOR, ELEMENT_GUIDE, ELEMENT_NAME, PATTERN_TEXT } from '../data/bazi';
import { analyzeBazi, type BaziResult } from '../lib/bazi';
import { BRANCHES, BRANCH_ELEMENT, ELEMENTS, STEMS, STEM_ELEMENT, toLunar, type BirthInput, type Element } from '../lib/calendar';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import './bazi.css';

type Stage = 'input' | 'casting' | 'done';

/** 旺衰阈值 0.36 / 0.5 映射到量表三等分 */
function meterPos(r: number) {
  const v = r < 0.36 ? (r / 0.36) * 33 : r < 0.5 ? 33 + ((r - 0.36) / 0.14) * 33 : 66 + ((r - 0.5) / 0.5) * 34;
  return Math.min(97, Math.max(3, v));
}

function nextAngle(prev: number, posDeg: number) {
  let target = -posDeg;
  while (target > prev - 240) target -= 360;
  while (target < prev - 600) target += 360;
  return target;
}

function Particles({ weights, dm, active }: { weights: Record<Element, number>; dm: Element; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const total = ELEMENTS.reduce((s, e) => s + weights[e], 0);
    const pool: Element[] = [];
    ELEMENTS.forEach((e) => {
      const n = Math.round((weights[e] / total) * 240);
      for (let i = 0; i < n; i++) pool.push(e);
    });
    type P = { e: Element; a: number; r: number; tr: number; w: number; s: number; born: number; y: number };
    const ps: P[] = [];
    let spawned = 0;
    let raf = 0;
    const start = performance.now();
    const cx = size / 2;
    const cy = size / 2;
    const loop = (now: number) => {
      const t = now - start;
      while (spawned < pool.length && spawned < t / 9) {
        const e = pool[Math.floor(Math.random() * pool.length)];
        ps.push({ e, a: -Math.PI / 2 + (Math.random() - 0.5) * 0.8, r: size * 0.47, tr: size * (0.14 + Math.random() * 0.36), w: 0.01 + Math.random() * 0.018, s: e === dm ? 2.4 : 1.3 + Math.random(), born: now, y: -size * 0.15 });
        spawned++;
      }
      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of ps) {
        p.a += p.w * (0.35 + 0.65 * Math.min(1, (now - p.born) / 1500));
        p.r += (p.tr - p.r) * 0.02;
        p.y *= 0.95;
        const x = cx + Math.cos(p.a) * p.r;
        const y = cy + Math.sin(p.a) * p.r * 0.92 + p.y;
        const flicker = 0.6 + Math.sin(now / 300 + p.tr) * 0.4;
        const rad = p.s * (p.e === dm ? 1.6 : 1);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 4);
        const c = ELEMENT_COLOR[p.e];
        g.addColorStop(0, c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = (p.e === dm ? 1 : 0.65) * flicker * Math.min(1, (now - p.born) / 400);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rad * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, weights, dm]);
  return <canvas ref={ref} className="bz-particles" aria-hidden />;
}

function Dial({ stemAngle, branchAngle, litStems, litBranches, spinning }: { stemAngle: number; branchAngle: number; litStems: string[]; litBranches: string[]; spinning: boolean }) {
  return (
    <svg className={`bz-dial${spinning ? ' spinning' : ''}`} viewBox="-250 -250 500 500">
      <defs>
        <radialGradient id="bz-core">
          <stop offset="0" stopColor="rgba(255,226,163,.35)" />
          <stop offset="1" stopColor="rgba(255,226,163,0)" />
        </radialGradient>
      </defs>
      <circle r="245" fill="rgba(10,8,22,.55)" stroke="rgba(232,194,122,.45)" />
      <g className="bz-ring" style={{ transform: `rotate(${branchAngle}deg)` }}>
        <circle r="215" fill="none" stroke="rgba(232,194,122,.25)" />
        {BRANCHES.map((b, i) => {
          const on = litBranches.includes(b);
          return (
            <g key={b} transform={`rotate(${i * 30})`}>
              <line y1={-245} y2={-215} stroke="rgba(232,194,122,.3)" transform="rotate(15)" />
              <text y={-224} textAnchor="middle" fontSize="26" fontFamily="var(--font-title)" fill={on ? ELEMENT_COLOR[BRANCH_ELEMENT[b]] : 'rgba(243,234,215,.55)'} className={on ? 'lit' : ''}>
                {b}
              </text>
            </g>
          );
        })}
      </g>
      <g className="bz-ring" style={{ transform: `rotate(${stemAngle}deg)` }}>
        <circle r="180" fill="none" stroke="rgba(117,132,255,.3)" />
        {STEMS.map((s, i) => {
          const on = litStems.includes(s);
          return (
            <g key={s} transform={`rotate(${i * 36})`}>
              <line y1={-180} y2={-150} stroke="rgba(117,132,255,.3)" transform="rotate(18)" />
              <text y={-158} textAnchor="middle" fontSize="24" fontFamily="var(--font-title)" fill={on ? ELEMENT_COLOR[STEM_ELEMENT[s]] : 'rgba(169,179,255,.6)'} className={on ? 'lit' : ''}>
                {s}
              </text>
            </g>
          );
        })}
      </g>
      <g className="bz-ring slow">
        {ELEMENTS.map((e, i) => {
          const a0 = (i / 5) * Math.PI * 2 - Math.PI / 2 + 0.04;
          const a1 = ((i + 1) / 5) * Math.PI * 2 - Math.PI / 2 - 0.04;
          const r = 118;
          return (
            <g key={e}>
              <path d={`M ${Math.cos(a0) * r} ${Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r}`} stroke={ELEMENT_COLOR[e]} strokeWidth="14" fill="none" opacity=".55" strokeLinecap="round" />
              <text x={Math.cos((a0 + a1) / 2) * 92} y={Math.sin((a0 + a1) / 2) * 92 + 7} textAnchor="middle" fontSize="20" fontFamily="var(--font-title)" fill={ELEMENT_COLOR[e]}>
                {e}
              </text>
            </g>
          );
        })}
      </g>
      <circle r="62" fill="url(#bz-core)" />
      <path d="M0,-252 l-9,-14 h18z" fill="var(--gold-hi)" />
    </svg>
  );
}

export default function BaZi() {
  const [birth, setBirth] = useState<BirthInput>({ kind: 'solar', year: 1995, month: 6, day: 15, shichen: 7 });
  const [gender, setGender] = useState<0 | 1>(1);
  const [stage, setStage] = useState<Stage>('input');
  const [result, setResult] = useState<BaziResult | null>(null);
  const [shown, setShown] = useState(0);
  const [angles, setAngles] = useState({ s: 0, b: 0 });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const cast = () => {
    let r: BaziResult;
    try {
      r = analyzeBazi(toLunar(birth), gender);
    } catch {
      alert('日期无效，请检查输入');
      return;
    }
    setResult(r);
    setStage('casting');
    setShown(0);
    let s = angles.s;
    let b = angles.b;
    r.pillars.forEach((p, i) => {
      later(() => {
        s = nextAngle(s, STEMS.indexOf(p.gan as (typeof STEMS)[number]) * 36);
        b = nextAngle(b, BRANCHES.indexOf(p.zhi as (typeof BRANCHES)[number]) * 30);
        setAngles({ s, b });
        sfx.whoosh();
      }, 200 + i * 1300);
      later(() => {
        setShown(i + 1);
        sfx.tick();
      }, 1200 + i * 1300);
    });
    later(() => {
      setStage('done');
      sfx.chime();
      recordResult({
        game: 'bazi',
        title: r.pillars.map((p) => p.gan + p.zhi).join(' '),
        summary: `日主${r.dayMaster}${r.dmElement} · ${r.strength} · ${r.pattern} · 喜用${r.yong}`,
        tone: 'ji',
      });
    }, 1200 + 4 * 1300);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage('input');
    setShown(0);
    setResult(null);
  };

  const lit = result ? result.pillars.slice(0, shown) : [];
  const totalCount = 8;
  const weightTotal = useMemo(() => (result ? ELEMENTS.reduce((s, e) => s + result.weights[e], 0) : 1), [result]);

  return (
    <GameShell id="bazi">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          {stage === 'input' && (
            <>
              <BirthForm value={birth} onChange={setBirth} gender={gender} onGender={setGender} />
              <button className="btn btn-primary btn-lg" onClick={cast}>
                启星盘 · 排四柱
              </button>
            </>
          )}
          <div className="bz-stage">
            <Dial stemAngle={angles.s} branchAngle={angles.b} litStems={lit.map((p) => p.gan)} litBranches={lit.map((p) => p.zhi)} spinning={stage === 'casting'} />
            {result && <Particles weights={result.weights} dm={result.dmElement} active={stage === 'done'} />}
          </div>
          {result && (
            <div className="bz-pillars">
              {result.pillars.map((p, i) => (
                <div key={p.label} className={`bz-pillar${i < shown ? ' on' : ''}${i === 2 ? ' dm' : ''}`}>
                  <div className="bz-pl">{p.label}</div>
                  <div className="bz-ss">{i < shown ? p.ganShiShen : ''}</div>
                  <div className="bz-gz calligraphy" style={{ color: i < shown ? ELEMENT_COLOR[STEM_ELEMENT[p.gan]] : undefined }}>
                    {i < shown ? p.gan : '？'}
                  </div>
                  <div className="bz-gz calligraphy" style={{ color: i < shown ? ELEMENT_COLOR[BRANCH_ELEMENT[p.zhi]] : undefined }}>
                    {i < shown ? p.zhi : '？'}
                  </div>
                  <div className="bz-hide">{i < shown ? p.hide.join(' ') : ''}</div>
                  <div className="bz-ny">{i < shown ? p.nayin : ''}</div>
                </div>
              ))}
            </div>
          )}
          <div className="rule-note">四柱以节气换月、立春换年（采用寿星天文历算法）；时辰取所选时辰中段换算。</div>
        </div>
      </div>

      {stage === 'done' && result && (
        <ResultCard
          tone="ji"
          kicker={`八字 · ${gender ? '乾造' : '坤造'} · ${birth.kind === 'solar' ? '阳历' : '农历'}${birth.year}年${Math.abs(birth.month)}月${birth.day}日`}
          title={result.pillars.map((p) => p.gan + p.zhi).join(' ')}
          subtitle={`日主 ${result.dayMaster}${result.dmElement} · ${DAY_MASTER[result.dayMaster].image} · ${result.pattern}`}
          badge={{ text: result.strength.slice(1), small: result.strength.slice(0, 1) + '主' }}
          onReplay={reset}
          replayLabel="重新排盘"
        >
          <h4>五行分布</h4>
          <div className="bz-bars">
            {ELEMENTS.map((e) => (
              <div key={e} className={`bz-bar${e === result.dmElement ? ' dm' : ''}`}>
                <span className="bz-bar-name" style={{ color: ELEMENT_COLOR[e] }}>
                  {ELEMENT_NAME[e]}
                </span>
                <span className="bz-bar-track">
                  <span className="bz-bar-fill" style={{ width: `${(result.weights[e] / weightTotal) * 100}%`, background: ELEMENT_COLOR[e] }} />
                </span>
                <span className="bz-bar-val">
                  {result.counts[e]}/{totalCount} · {Math.round((result.weights[e] / weightTotal) * 100)}%
                </span>
              </div>
            ))}
          </div>
          {result.missing.length > 0 && <div className="muted" style={{ fontSize: 13 }}>明见八字中缺「{result.missing.join('、')}」，可从藏干与后天调补。</div>}

          <h4>日主旺衰</h4>
          <div className="bz-meter">
            <span className="bz-meter-mark" style={{ left: `${meterPos(result.supportRatio)}%` }} />
            <span>弱</span>
            <span>中和</span>
            <span>强</span>
          </div>
          <div className="rc-plain">
            {DAY_MASTER[result.dayMaster].text}
            <br />
            生扶之力约占 {Math.round(result.supportRatio * 100)}%，判为「{result.strength}」。
            {result.strength === '身强' ? '精力旺盛、主见强，宜发挥所长、以泄秀或担当来疏导旺气。' : result.strength === '身弱' ? '心思细腻、善借外力，宜多得贵人与学习的滋养。' : '五行流通较为平衡，进退有度、适应力强。'}
          </div>

          <h4>格局 · {result.pattern}</h4>
          <div className="rc-plain">{PATTERN_TEXT[result.pattern] ?? '格局清奇，宜因势利导。'}</div>

          <h4>喜用神</h4>
          <div className="aspect-grid">
            <div className="aspect">
              <b>用神 · {result.yong}</b>
              宜色 {ELEMENT_GUIDE[result.yong].color}，利方 {ELEMENT_GUIDE[result.yong].direction}；行业可参考 {ELEMENT_GUIDE[result.yong].fields}。
            </div>
            <div className="aspect">
              <b>喜神 · {result.xi}</b>
              辅助用神之力，宜色 {ELEMENT_GUIDE[result.xi].color}。
            </div>
            <div className="aspect">
              <b>忌神 · {result.ji}</b>
              此行过旺则失衡，{ELEMENT_GUIDE[result.ji].color}等可少用。
            </div>
          </div>

          {result.yun.length > 0 && (
            <>
              <h4>大运</h4>
              <div className="bz-yun">
                {result.yun.slice(0, 8).map((y) => (
                  <div key={y.startYear} className="bz-yun-item">
                    <div className="calligraphy" style={{ fontSize: 22 }}>
                      <span style={{ color: ELEMENT_COLOR[STEM_ELEMENT[y.ganZhi[0]]] }}>{y.ganZhi[0]}</span>
                      <span style={{ color: ELEMENT_COLOR[BRANCH_ELEMENT[y.ganZhi[1]]] }}>{y.ganZhi[1]}</span>
                    </div>
                    <small>{y.startAge}岁</small>
                    <small>{y.startYear}</small>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="muted" style={{ fontSize: 12, marginTop: 14 }}>
            旺衰按天干 1、藏干本中余气 1/0.5/0.3、月令加权估算；用神取扶抑法简化，仅供娱乐参考。
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}
