import { useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import ResultCard, { Stars } from '../components/ResultCard';
import { DAILY_PHRASES, LUCKY_COLORS } from '../data/daily';
import { taiSuiRelations, type TaiSuiRelation } from '../data/zodiac';
import { BRANCHES, ELEMENTS, STEM_ELEMENT, ZODIAC, generates, nowLunar } from '../lib/calendar';
import { hashString, seeded } from '../lib/random';
import { sfx } from '../lib/sound';
import { checkIn, dateKey, recordResult, setZodiac, streak, useStore } from '../lib/storage';
import type { Tone } from '../lib/tone';
import './daily.css';

const DAY_REL: Record<TaiSuiRelation, { name: string; score: number }> = {
  值太岁: { name: '日逢本命', score: 4 },
  冲太岁: { name: '日冲生肖', score: -16 },
  刑太岁: { name: '日刑生肖', score: -8 },
  害太岁: { name: '日害生肖', score: -6 },
  破太岁: { name: '日破生肖', score: -5 },
  六合: { name: '日合生肖', score: 12 },
  三合: { name: '三合吉日', score: 10 },
};

export function dailyFortune(date: Date, zodiac: number | null) {
  const l = nowLunar(date);
  const key = dateKey(date);
  const rng = seeded(hashString(`daily-${key}-${zodiac ?? 'x'}`));
  const dayZhi = BRANCHES.indexOf(l.getDayZhi() as (typeof BRANCHES)[number]);
  const rels = zodiac === null ? [] : taiSuiRelations(zodiac, dayZhi);
  const bonus = rels.reduce((s, r) => s + DAY_REL[r].score, 0);
  const score = Math.max(18, Math.min(99, Math.round(50 + rng() * 40 + bonus)));
  const level = score >= 88 ? '大吉' : score >= 74 ? '吉' : score >= 60 ? '小吉' : score >= 45 ? '平' : '凶';
  const tone: Tone = score >= 60 ? 'ji' : score >= 45 ? 'ping' : 'xiong';
  const pool = DAILY_PHRASES[score >= 74 ? 'high' : score >= 45 ? 'mid' : 'low'];
  const phrase = pool[Math.floor(rng() * pool.length)];
  const dayEl = STEM_ELEMENT[l.getDayGan()];
  const luckyEl = ELEMENTS.find((e) => generates(e) === dayEl)!;
  const colors = LUCKY_COLORS[luckyEl];
  const color = colors[Math.floor(rng() * colors.length)];
  const n1 = 1 + Math.floor(rng() * 9);
  let n2 = 1 + Math.floor(rng() * 9);
  if (n2 === n1) n2 = (n1 % 9) + 1;
  const aspects = ['事业', '财运', '感情', '健康'].map((k) => ({ k, v: Math.max(1, Math.min(5, Math.round((score + (rng() - 0.5) * 34 - 25) / 15))) }));
  const yi = l.getDayYi().filter((x) => x !== '无').slice(0, 6);
  const ji = l.getDayJi().filter((x) => x !== '无').slice(0, 6);
  return {
    l,
    key,
    score,
    level,
    tone,
    phrase,
    color,
    luckyEl,
    numbers: [n1, n2].sort((a, b) => a - b),
    aspects,
    yi: yi.length ? yi : ['诸事不宜大动'],
    ji: ji.length ? ji : ['无特别禁忌'],
    cai: l.getDayPositionCaiDesc(),
    xi: l.getDayPositionXiDesc(),
    chong: l.getDayChongDesc(),
    sha: l.getDaySha(),
    rels: rels.map((r) => DAY_REL[r].name),
  };
}

function Gauge({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg className="dl-gauge" viewBox="-64 -64 128 128">
      <circle r={r} className="track" />
      <circle r={r} className="bar" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90)" />
      <text y="10" textAnchor="middle" className="num">
        {value}
      </text>
      <text y="30" textAnchor="middle" className="cap">
        运势指数
      </text>
    </svg>
  );
}

export default function Daily() {
  const today = useMemo(() => new Date(), []);
  const key = dateKey(today);
  const zodiac = useStore((s) => s.zodiac);
  const checkins = useStore((s) => s.checkins);
  const signedToday = checkins.includes(key);
  const [opened, setOpened] = useState(signedToday);
  const [tearing, setTearing] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const f = useMemo(() => dailyFortune(today, zodiac), [today, zodiac]);
  const l = f.l;

  const open = () => {
    setTearing(true);
    sfx.paper();
    timer.current = window.setTimeout(() => {
      setOpened(true);
      setTearing(false);
      sfx.chime();
      if (!signedToday) {
        checkIn(key);
        recordResult({ game: 'daily', title: `${key} · ${f.level} · ${f.score}`, summary: f.phrase, tone: f.tone });
      }
    }, 1100);
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { d, on: checkins.includes(dateKey(d)) || (i === 6 && opened) };
  });

  return (
    <GameShell id="daily">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          <div className="dl-zodiac">
            <span className="muted" style={{ fontSize: 13, letterSpacing: 2 }}>
              选择生肖，日签将结合当日地支推算（可不选）
            </span>
            <div className="dl-zodiac-list">
              {ZODIAC.map((z, i) => (
                <button key={z} className={`dl-z${zodiac === i ? ' on' : ''}`} onClick={() => setZodiac(zodiac === i ? null : i)}>
                  {z}
                </button>
              ))}
            </div>
          </div>

          <div className="dl-calendar">
            <div className="dl-rings">
              <i />
              <i />
            </div>
            <div className="dl-under">
              <div className="dl-under-level calligraphy">{f.level}</div>
              <div className="dl-under-phrase">{f.phrase}</div>
            </div>
            {!opened && (
              <div className={`dl-page${tearing ? ' tear' : ''}`} onClick={() => !tearing && open()}>
                <div className="dl-page-top">
                  {today.getFullYear()} · {today.getMonth() + 1}月 · 星期{'日一二三四五六'[today.getDay()]}
                </div>
                <div className="dl-page-day">{today.getDate()}</div>
                <div className="dl-page-lunar calligraphy">
                  {l.getMonthInChinese()}月{l.getDayInChinese()}
                </div>
                <div className="dl-page-gz">
                  {l.getYearInGanZhi()}年 {l.getMonthInGanZhi()}月 {l.getDayInGanZhi()}日{l.getJieQi() ? ` · ${l.getJieQi()}` : ''}
                </div>
                <div className="dl-page-yj">
                  <span className="yi">宜</span> {f.yi.slice(0, 3).join(' ')}
                  <br />
                  <span className="ji">忌</span> {f.ji.slice(0, 3).join(' ')}
                </div>
                <div className="dl-page-hint">点击撕开今日签</div>
              </div>
            )}
          </div>

          {!opened && (
            <button className="btn btn-primary btn-lg" onClick={open} disabled={tearing}>
              撕开今日签
            </button>
          )}

          <div className="dl-week">
            {week.map(({ d, on }, i) => (
              <div key={i} className={`dl-day${on ? ' on' : ''}${i === 6 ? ' today' : ''}`}>
                <small>{'日一二三四五六'[d.getDay()]}</small>
                <span>{d.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="hint">已连续签到 {streak(checkins, today)} 天 · 累计 {checkins.length} 天</div>
        </div>
      </div>

      {opened && (
        <ResultCard
          tone={f.tone}
          kicker={`幸运日签 · ${key} · ${l.getDayInGanZhi()}日${zodiac !== null ? ` · 属${ZODIAC[zodiac]}` : ''}`}
          title={`${l.getMonthInChinese()}月${l.getDayInChinese()}`}
          subtitle={f.rels.length ? f.rels.join(' · ') : zodiac === null ? '选择生肖可获得更贴合的日签' : '今日地支与生肖平和'}
          badge={{ text: f.level, small: '今日' }}
          poem={[f.phrase]}
        >
          <div className="dl-grid">
            <Gauge value={f.score} />
            <div className="dl-aspects">
              {f.aspects.map((a) => (
                <div key={a.k}>
                  <span className="muted">{a.k}</span> <Stars value={a.v} />
                </div>
              ))}
            </div>
          </div>
          <h4>黄历宜忌</h4>
          <div className="dl-yj">
            <div>
              <span className="tag yi">宜</span>
              {f.yi.map((x) => (
                <span key={x} className="chip">{x}</span>
              ))}
            </div>
            <div>
              <span className="tag ji">忌</span>
              {f.ji.map((x) => (
                <span key={x} className="chip">{x}</span>
              ))}
            </div>
          </div>
          <h4>今日开运</h4>
          <div className="aspect-grid">
            <div className="aspect">
              <b>幸运色</b>
              <span className="dl-swatch" style={{ background: f.color.hex }} /> {f.color.name}（{f.luckyEl}生日主）
            </div>
            <div className="aspect">
              <b>幸运数字</b>
              {f.numbers.join('、')}
            </div>
            <div className="aspect">
              <b>吉方</b>
              财神{f.cai} · 喜神{f.xi}
            </div>
            <div className="aspect">
              <b>冲煞</b>
              冲{f.chong} · 煞{f.sha}
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            宜忌、方位取自传统黄历推算；运势指数按日期{zodiac !== null ? '与生肖' : ''}派生，同日同签，明日再来翻新一页。
          </div>
        </ResultCard>
      )}
    </GameShell>
  );
}
