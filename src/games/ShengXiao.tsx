import { Solar } from 'lunar-javascript';
import { useMemo, useState } from 'react';
import GameShell from '../components/GameShell';
import ResultCard, { Stars } from '../components/ResultCard';
import { ASPECT_TEXT, RELATION_SCORE, RELATION_TEXT, ZODIAC_INFO, harmonyPartners, taiSuiRelations } from '../data/zodiac';
import { BRANCHES, ZODIAC, nowLunar } from '../lib/calendar';
import { hashString, seeded } from '../lib/random';
import { sfx } from '../lib/sound';
import { recordResult, setZodiac, useStore } from '../lib/storage';
import type { Tone } from '../lib/tone';
import './shengxiao.css';

const STEM_OF_YEAR = (y: number) => '庚辛壬癸甲乙丙丁戊己'[y % 10];

export function fortuneOf(zodiac: number, year: number) {
  const taiSui = ((year - 4) % 12 + 12) % 12;
  const rels = taiSuiRelations(zodiac, taiSui);
  const rng = seeded(hashString(`sx-${zodiac}-${year}`));
  const score = Math.max(20, Math.min(98, Math.round(68 + rels.reduce((s, r) => s + RELATION_SCORE[r], 0) + (rng() - 0.5) * 12)));
  const level = score >= 85 ? '大吉' : score >= 72 ? '吉' : score >= 58 ? '平' : score >= 45 ? '小凶' : '凶';
  const tone: Tone = score >= 72 ? 'ji' : score >= 58 ? 'ping' : 'xiong';
  const aspects = Object.keys(ASPECT_TEXT).map((k) => {
    const s = score + (rng() - 0.5) * 30;
    const stars = Math.max(1, Math.min(5, Math.round((s - 30) / 13)));
    return { label: k, stars, text: ASPECT_TEXT[k][stars >= 4 ? 0 : stars === 3 ? 1 : 2] };
  });
  return { taiSui, rels, score, level, tone, aspects };
}

export default function ShengXiao() {
  const thisYear = new Date().getFullYear();
  const currentLunarZhi = nowLunar().getYearZhiByLiChun();
  const defaultYear = BRANCHES.indexOf(currentLunarZhi as (typeof BRANCHES)[number]) === (((thisYear - 4) % 12) + 12) % 12 ? thisYear : thisYear - 1;
  const saved = useStore((s) => s.zodiac);
  const [year, setYear] = useState(defaultYear);
  const [picked, setPicked] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(saved);
  const [birth, setBirth] = useState('');

  const taiSui = ((year - 4) % 12 + 12) % 12;
  const result = useMemo(() => (picked === null ? null : fortuneOf(picked, year)), [picked, year]);
  const focus = picked ?? hover;
  const partners = focus !== null ? harmonyPartners(focus) : null;

  const choose = (i: number) => {
    setPicked(i);
    setZodiac(i);
    sfx.gong();
    const r = fortuneOf(i, year);
    recordResult({ game: 'shengxiao', title: `属${ZODIAC[i]} · ${year}${STEM_OF_YEAR(year)}${BRANCHES[taiSui]}年 · ${r.level}`, summary: r.rels.length ? r.rels.join('、') : '与太岁无刑冲合害', tone: r.tone });
  };

  const fromBirth = () => {
    const m = birth.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return;
    const zhi = Solar.fromYmd(+m[1], +m[2], +m[3]).getLunar().getYearZhiByLiChun();
    choose(BRANCHES.indexOf(zhi as (typeof BRANCHES)[number]));
  };

  const pos = (i: number, r = 40) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  };

  return (
    <GameShell id="shengxiao">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          <div className="form-row" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <label className="field" style={{ flex: '0 0 auto' }}>
              推算流年
              <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {Array.from({ length: 7 }, (_, i) => defaultYear - 1 + i).map((y) => (
                  <option key={y} value={y}>
                    {y} {STEM_OF_YEAR(y)}
                    {BRANCHES[((y - 4) % 12 + 12) % 12]}年 · {ZODIAC[((y - 4) % 12 + 12) % 12]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field" style={{ flex: '0 0 auto' }}>
              不知属相？按生日推算（立春为界）
              <span style={{ display: 'flex', gap: 8 }}>
                <input className="input" type="date" value={birth} min="1900-01-01" max="2099-12-31" onChange={(e) => setBirth(e.target.value)} />
                <button className="btn" onClick={fromBirth} disabled={!birth}>
                  推算
                </button>
              </span>
            </label>
          </div>

          <div className="sx-wheel">
            <svg className="sx-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(232,194,122,.18)" strokeWidth=".3" />
              <circle cx="50" cy="50" r="27" fill="none" stroke="rgba(232,194,122,.12)" strokeWidth=".3" strokeDasharray="1 1.5" />
              {partners && focus !== null && (
                <g key={focus}>
                  <polygon className="sx-tri" points={[focus, ...partners.sanhe].map((i) => `${pos(i).x},${pos(i).y}`).join(' ')} />
                  <line className="sx-he" x1={pos(focus).x} y1={pos(focus).y} x2={pos(partners.liuhe).x} y2={pos(partners.liuhe).y} />
                  <line className="sx-chong" x1={pos(focus).x} y1={pos(focus).y} x2={pos(partners.chong).x} y2={pos(partners.chong).y} />
                </g>
              )}
            </svg>
            {ZODIAC.map((z, i) => {
              const p = pos(i);
              const cls = [
                'sx-head',
                i === picked ? 'picked' : '',
                i === taiSui ? 'taisui' : '',
                partners && focus !== i && (partners.sanhe.includes(i) || partners.liuhe === i) ? 'ally' : '',
                partners && partners.chong === i ? 'foe' : '',
              ].join(' ');
              return (
                <button
                  key={z}
                  className={cls}
                  style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 0.05}s` }}
                  onClick={() => choose(i)}
                  onPointerEnter={() => setHover(i)}
                  aria-label={`属${z}`}
                >
                  <span className="sx-animal calligraphy">{z}</span>
                  <span className="sx-branch">{BRANCHES[i]}</span>
                  {i === taiSui && <span className="sx-ts">太岁</span>}
                </button>
              );
            })}
            <div className="sx-center">
              <div className="muted" style={{ fontSize: 12, letterSpacing: 3 }}>{year} 流年太岁</div>
              <div className="calligraphy gold-text sx-year">
                {STEM_OF_YEAR(year)}
                {BRANCHES[taiSui]}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{ZODIAC[taiSui]}年</div>
            </div>
          </div>
          <div className="hint">
            点击你的生肖铜像 · <span style={{ color: 'var(--gold)' }}>金线</span>为三合六合，<span style={{ color: 'var(--indigo)' }}>靛线</span>为相冲
          </div>
        </div>
      </div>

      {result && picked !== null && (
        <ResultCard
          key={`${picked}-${year}`}
          tone={result.tone}
          kicker={`生肖推命 · ${year}${STEM_OF_YEAR(year)}${BRANCHES[taiSui]}年 · 运势指数 ${result.score}`}
          title={`属${ZODIAC[picked]}`}
          subtitle={result.rels.length ? `与太岁：${result.rels.join(' · ')}` : '与太岁无刑冲合害'}
          badge={{ text: result.level, small: '流年' }}
          onReplay={() => setPicked(null)}
          replayLabel="换个生肖"
        >
          <h4>太岁关系</h4>
          <div className="rc-plain">
            {result.rels.length ? result.rels.map((r) => <div key={r}>· {RELATION_TEXT[r]}</div>) : '与太岁无刑冲合害，运势平稳，按部就班即可稳中有进。'}
          </div>
          <h4>四方运势</h4>
          <div className="aspect-grid">
            {result.aspects.map((a) => (
              <div className="aspect" key={a.label}>
                <b>
                  {a.label} <Stars value={a.stars} />
                </b>
                {a.text}
              </div>
            ))}
          </div>
          <h4>属{ZODIAC[picked]}之人</h4>
          <div className="rc-plain">
            {ZODIAC_INFO[picked].nature}
            <br />
            幸运色：{ZODIAC_INFO[picked].colors} · 幸运数字：{ZODIAC_INFO[picked].numbers}
            <br />
            贵人生肖：{[harmonyPartners(picked).liuhe, ...harmonyPartners(picked).sanhe].map((i) => ZODIAC[i]).join('、')}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            同年同属者共享此推断，乃全殿最简化之玩法，宜作轻松参考。
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}
