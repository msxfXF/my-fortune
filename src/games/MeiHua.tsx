import { useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import HexLines from '../components/HexLines';
import ResultCard from '../components/ResultCard';
import { BRANCHES, nowLunar, relation, shichenIndex, type Relation } from '../lib/calendar';
import { changeLines, hexagramByTrigrams, huGua, trigramByNumber, type Hexagram, type Trigram } from '../lib/hexagram';
import { randInt } from '../lib/random';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import type { Tone } from '../lib/tone';
import './meihua.css';

type Method = 'time' | 'number' | 'rods';

const TIYONG: Record<Relation, { level: string; tone: Tone; text: string; score: number }> = {
  生我: { level: '大吉', tone: 'ji', score: 2, text: '用生体，有进益之喜：所谋易成，多得他人相助。' },
  比和: { level: '吉', tone: 'ji', score: 1, text: '体用比和，百事顺遂：彼此同心，合作可成。' },
  我克: { level: '吉', tone: 'ji', score: 0.6, text: '体克用，事可成而需费心力：主动出击，则有所得。' },
  我生: { level: '小凶', tone: 'xiong', score: -0.8, text: '体生用，有耗泄之象：付出多而回报少，宜量力而行。' },
  克我: { level: '凶', tone: 'xiong', score: -1.6, text: '用克体，事多阻滞：宜谨慎退守，等待时机。' },
};
const OUTCOME: Record<Relation, string> = {
  生我: '变卦生体，结局向好，后势有助。',
  比和: '变卦比和，结局平顺，善始善终。',
  我克: '体克变卦，结局可控，但需亲力亲为。',
  我生: '体生变卦，后段多耗，谨防虎头蛇尾。',
  克我: '变卦克体，后期恐有变数，宜预留退路。',
};
const PROCESS: Record<Relation, string> = {
  生我: '过程中得人扶助',
  比和: '过程平稳',
  我克: '过程尚可掌控',
  我生: '过程多有付出',
  克我: '过程中有阻力',
};

interface Cast {
  method: Method;
  upperNum: number;
  lowerNum: number;
  movingNum: number;
  formula: string[];
}

interface Rod {
  x: number;
  y: number;
  r: number;
  side: 0 | 1;
}

export default function MeiHua() {
  const [method, setMethod] = useState<Method>('time');
  const [nums, setNums] = useState({ a: '', b: '' });
  const [cast, setCast] = useState<Cast | null>(null);
  const [rods, setRods] = useState<Rod[] | null>(null);
  const [rodPhase, setRodPhase] = useState<'scatter' | 'split' | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const castTime = () => {
    const now = new Date();
    const l = nowLunar(now);
    const y = BRANCHES.indexOf(l.getYearZhi() as (typeof BRANCHES)[number]) + 1;
    const m = Math.abs(l.getMonth());
    const d = l.getDay();
    const h = shichenIndex(now.getHours());
    const up = y + m + d;
    const low = up + h;
    finish({
      method: 'time',
      upperNum: up,
      lowerNum: low,
      movingNum: low,
      formula: [
        `年支 ${l.getYearZhi()}(${y}) + 农历 ${m} 月 + ${d} 日 = ${up} → 上卦 ${up} ÷ 8 余 ${up % 8 || 8}`,
        `再加 ${BRANCHES[h - 1]}时(${h}) = ${low} → 下卦 ${low} ÷ 8 余 ${low % 8 || 8}`,
        `动爻：${low} ÷ 6 余 ${low % 6 || 6}`,
      ],
    });
  };

  const castNumbers = (a: number, b: number, via: Method) => {
    const h = shichenIndex(new Date().getHours());
    const mv = a + b + h;
    finish({
      method: via,
      upperNum: a,
      lowerNum: b,
      movingNum: mv,
      formula: [`上卦：${a} ÷ 8 余 ${a % 8 || 8}`, `下卦：${b} ÷ 8 余 ${b % 8 || 8}`, `动爻：(${a} + ${b} + ${BRANCHES[h - 1]}时 ${h}) = ${mv}，÷ 6 余 ${mv % 6 || 6}`],
    });
  };

  const throwRods = () => {
    const total = 49;
    const list: Rod[] = Array.from({ length: total }, () => ({ x: 8 + Math.random() * 84, y: 10 + Math.random() * 70, r: Math.random() * 180, side: randInt(2) as 0 | 1 }));
    if (list.every((r) => r.side === 0)) list[0].side = 1;
    if (list.every((r) => r.side === 1)) list[0].side = 0;
    setRods(list);
    setRodPhase(null);
    setCast(null);
    later(() => setRodPhase('scatter'), 40);
    for (let i = 0; i < 5; i++) later(() => sfx.clack(), i * 70);
    later(() => {
      setRodPhase('split');
      sfx.whoosh();
    }, 1000);
    later(() => {
      const a = list.filter((r) => r.side === 0).length;
      castNumbers(a, total - a, 'rods');
    }, 2000);
  };

  const finish = (c: Cast) => {
    setCast(c);
    sfx.chime();
    const r = compute(c);
    recordResult({ game: 'meihua', title: `${r.ben.fullName} 之 ${r.bian.fullName}`, summary: `体${r.ti.name}${r.ti.element} · 用${r.yong.name}${r.yong.element} · ${r.main.text}`, tone: r.tone });
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setCast(null);
    setRods(null);
    setRodPhase(null);
  };

  const result = useMemo(() => (cast ? compute(cast) : null), [cast]);
  const a = Number(nums.a);
  const b = Number(nums.b);
  const numsValid = Number.isInteger(a) && Number.isInteger(b) && a > 0 && b > 0 && a < 100000 && b < 100000;

  return (
    <GameShell id="meihua">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          {!cast && (
            <div className="segmented">
              <button className={method === 'time' ? 'active' : ''} onClick={() => setMethod('time')}>时间起卦</button>
              <button className={method === 'number' ? 'active' : ''} onClick={() => setMethod('number')}>报数起卦</button>
              <button className={method === 'rods' ? 'active' : ''} onClick={() => setMethod('rods')}>掷算筹</button>
            </div>
          )}

          {!cast && method === 'time' && (
            <>
              <div className="mh-plum">
                <svg viewBox="-60 -60 120 120">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ellipse key={i} cx="0" cy="-24" rx="17" ry="24" transform={`rotate(${i * 72})`} fill="rgba(233,88,74,.22)" stroke="rgba(255,180,170,.7)" />
                  ))}
                  <circle r="9" fill="rgba(255,226,163,.8)" />
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={i} x1="0" y1="0" x2="0" y2="-17" stroke="rgba(255,226,163,.8)" transform={`rotate(${i * 36})`} />
                  ))}
                </svg>
              </div>
              <div className="hint">以此刻农历年支、月、日、时辰数起卦</div>
              <button className="btn btn-primary btn-lg" onClick={castTime}>
                此刻起卦
              </button>
            </>
          )}

          {!cast && method === 'number' && (
            <>
              <div className="hint">心念所问，随口报出两个数字（如字数、门牌、任意灵感数）</div>
              <div className="form-row" style={{ justifyContent: 'center' }}>
                <label className="field" style={{ flex: '0 1 160px' }}>
                  第一个数（上卦）
                  <input className="input" inputMode="numeric" value={nums.a} onChange={(e) => setNums({ ...nums, a: e.target.value.replace(/\D/g, '') })} />
                </label>
                <label className="field" style={{ flex: '0 1 160px' }}>
                  第二个数（下卦）
                  <input className="input" inputMode="numeric" value={nums.b} onChange={(e) => setNums({ ...nums, b: e.target.value.replace(/\D/g, '') })} />
                </label>
              </div>
              <button className="btn btn-primary btn-lg" disabled={!numsValid} onClick={() => castNumbers(a, b, 'number')}>
                以数起卦
              </button>
            </>
          )}

          {method === 'rods' && !cast && (
            <>
              <div className={`mh-table${rodPhase ? ` ${rodPhase}` : ''}`}>
                {rods?.map((r, i) => (
                  <span
                    key={i}
                    className={`mh-rod side-${r.side}`}
                    style={{ '--x': `${r.x}%`, '--y': `${r.y}%`, '--r': `${r.r}deg`, '--i': i } as React.CSSProperties}
                  />
                ))}
                {rodPhase === 'split' && rods && (
                  <>
                    <div className="mh-count left">{rods.filter((r) => r.side === 0).length}</div>
                    <div className="mh-count right">{rods.filter((r) => r.side === 1).length}</div>
                  </>
                )}
                {!rods && <div className="mh-empty">四十九根算筹，信手一掷，分作左右两堆</div>}
              </div>
              <button className="btn btn-primary btn-lg" disabled={!!rods} onClick={throwRods}>
                掷 算 筹
              </button>
            </>
          )}

          {cast && result && (
            <div className="mh-hexes fade-up">
              {[
                { h: result.ben, label: '本卦', mv: [result.moving] },
                { h: result.hu, label: '互卦', mv: [] },
                { h: result.bian, label: '变卦', mv: [] },
              ].map((x, i) => (
                <div key={x.label} className="mh-hex" style={{ animationDelay: `${i * 0.25}s` }}>
                  <div className="muted">{x.label}</div>
                  <HexLines lines={x.h.lines} moving={x.mv} size={92} />
                  <div className="calligraphy gold-text mh-hex-name">{x.h.fullName}</div>
                </div>
              ))}
            </div>
          )}
          <div className="rule-note">先天八卦数：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8；数除以 8 取余定卦（余 0 作 8），除以 6 取余定动爻（余 0 作 6）。</div>
        </div>
      </div>

      {cast && result && (
        <ResultCard
          tone={result.tone}
          kicker={`梅花易数 · ${cast.method === 'time' ? '时间起卦' : cast.method === 'rods' ? '算筹起卦' : '报数起卦'} · 动在第${result.moving + 1}爻`}
          title={result.ben.fullName}
          subtitle={`互「${result.hu.fullName}」· 变「${result.bian.fullName}」`}
          badge={{ text: result.verdict, small: '体用' }}
          onReplay={reset}
          replayLabel="重新起卦"
        >
          <h4>起卦</h4>
          <div className="rc-plain mh-formula">
            {cast.formula.map((f) => (
              <div key={f}>{f}</div>
            ))}
          </div>
          <h4>体用</h4>
          <div className="mh-tiyong">
            <TrigramChip t={result.ti} label="体卦" />
            <div className="mh-rel">{result.mainRel === '生我' ? '用 → 生 → 体' : result.mainRel === '克我' ? '用 → 克 → 体' : result.mainRel === '我克' ? '体 → 克 → 用' : result.mainRel === '我生' ? '体 → 生 → 用' : '体 ＝ 用'}</div>
            <TrigramChip t={result.yong} label="用卦" />
          </div>
          <div className="rc-plain">
            {result.main.text}
            <br />
            互卦{PROCESS[result.huRel]}；{OUTCOME[result.bianRel]}
          </div>
          <h4>卦意</h4>
          <div className="rc-plain">
            <b style={{ color: 'var(--accent-hi)' }}>{result.ben.name}：</b>
            {result.ben.judgement} {result.ben.plain}
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}

function TrigramChip({ t, label }: { t: Trigram; label: string }) {
  return (
    <div className="mh-chip">
      <div className="mh-chip-sym">{t.symbol}</div>
      <div>
        {label} · {t.name}
        {t.image}
      </div>
      <small>五行属{t.element}</small>
    </div>
  );
}

function compute(c: Cast) {
  const upper = trigramByNumber(c.upperNum);
  const lower = trigramByNumber(c.lowerNum);
  const moving = (c.movingNum % 6 || 6) - 1;
  const ben: Hexagram = hexagramByTrigrams(upper, lower);
  const hu = huGua(ben);
  const bian = changeLines(ben, [moving]);
  const yongInLower = moving < 3;
  const ti = yongInLower ? upper : lower;
  const yong = yongInLower ? lower : upper;
  const bianYong = yongInLower ? bian.lower : bian.upper;
  const mainRel = relation(ti.element, yong.element);
  const main = TIYONG[mainRel];
  const huRelRaw = [relation(ti.element, hu.upper.element), relation(ti.element, hu.lower.element)];
  const huRel = huRelRaw.includes('克我') ? '克我' : huRelRaw.includes('生我') ? '生我' : huRelRaw[0];
  const bianRel = relation(ti.element, bianYong.element);
  const score = main.score + TIYONG[bianRel].score * 0.6 + TIYONG[huRel].score * 0.25;
  const tone: Tone = score >= 0.5 ? 'ji' : score <= -0.5 ? 'xiong' : 'ping';
  const verdict = score >= 1.8 ? '大吉' : score >= 0.5 ? '吉' : score <= -1.5 ? '凶' : score <= -0.5 ? '小凶' : '平';
  return { ben, hu, bian, moving, ti, yong, mainRel, main, huRel, bianRel, tone, verdict };
}
