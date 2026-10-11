import { useRef } from 'react';
import Compass from './components/Compass';
import { GAME_ICONS } from './components/Icons';
import Seal from './components/Seal';
import { GAMES, type GameMeta } from './games/meta';
import { nowLunar } from './lib/calendar';
import { randInt } from './lib/random';
import { dateKey, streak, useStore } from './lib/storage';

function GameCard({ g, lit, index }: { g: GameMeta; lit: boolean; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <a ref={ref} className="game-card fade-up" style={{ animationDelay: `${index * 0.06}s` }} href={`#/game/${g.id}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="gc-icon">{GAME_ICONS[g.id]}</div>
      {lit && (
        <div className="gc-seal">
          <Seal text={g.seal} size={40} />
        </div>
      )}
      <h3>{g.name}</h3>
      <p>{g.desc}</p>
      <div className="gc-foot">
        <span>{g.tagline}</span>
        <span className="gc-tag">{lit ? '已点亮' : '入殿'}</span>
      </div>
    </a>
  );
}

export default function Home() {
  const seals = useStore((s) => s.seals);
  const count = useStore((s) => s.history.length);
  const checkins = useStore((s) => s.checkins);
  const lit = GAMES.filter((g) => seals[g.id]).length;
  const today = new Date();
  const lunar = nowLunar(today);
  const signed = checkins.includes(dateKey(today));

  const randomGame = () => {
    const g = GAMES[randInt(GAMES.length)];
    location.hash = `#/game/${g.id}`;
  };

  return (
    <>
      <section className="hero">
        <Compass className="hero-compass" />
        <div className="eyebrow fade-up" style={{ position: 'relative' }}>
          观天象 · 问吉凶 · 卜未来
        </div>
        <h1 className="hero-title gold-text fade-up" style={{ animationDelay: '.1s' }}>
          云卜轩
        </h1>
        <div className="hero-sub fade-up" style={{ animationDelay: '.2s' }}>
          一殿十一术，东西方占卜尽在指间
        </div>
        <div className="hero-actions fade-up" style={{ animationDelay: '.3s' }}>
          <button className="btn btn-primary btn-lg" onClick={randomGame}>
            随缘一问
          </button>
          <a className="btn btn-lg" href="#/game/daily">
            {signed ? '查看今日签' : '翻开今日签'}
          </a>
        </div>
        <div className="hero-stats fade-up" style={{ animationDelay: '.4s' }}>
          <div>
            <b>{GAMES.length}</b>种玩法
          </div>
          <div>
            <b>
              {lit}/{GAMES.length}
            </b>
            印章
          </div>
          <div>
            <b>{count}</b>次问卜
          </div>
          <div>
            <b>{streak(checkins)}</b>天连签
          </div>
        </div>
      </section>

      <div className="container">
        <a className="panel daily-banner fade-up" href="#/game/daily">
          <div className="daily-date">
            <div className="d">{today.getDate()}</div>
            <div className="m">
              {today.getMonth() + 1}月 · 周{'日一二三四五六'[today.getDay()]}
            </div>
          </div>
          <div>
            <div className="calligraphy" style={{ fontSize: 26, letterSpacing: 4 }}>
              {lunar.getYearInGanZhi()}年 {lunar.getMonthInChinese()}月{lunar.getDayInChinese()}
            </div>
            <div className="muted" style={{ fontSize: 13, letterSpacing: 2, marginTop: 4 }}>
              {lunar.getDayInGanZhi()}日 · 宜 {lunar.getDayYi().slice(0, 3).join(' ')}
              {lunar.getJieQi() && ` · ${lunar.getJieQi()}`}
            </div>
          </div>
          <span className="btn">{signed ? '已签到 ✓' : '每日签到'}</span>
        </a>

        <div className="section-head">
          <h2 className="gold-text">镇殿五术</h2>
          <span className="muted" style={{ fontSize: 13, letterSpacing: 2 }}>
            一期 · 经典之选
          </span>
          <div className="line" />
        </div>
        <div className="game-grid core">
          {GAMES.filter((g) => g.group === 'core').map((g, i) => (
            <GameCard key={g.id} g={g} lit={!!seals[g.id]} index={i} />
          ))}
        </div>

        <div className="section-head">
          <h2 className="gold-text">雅玩六艺</h2>
          <span className="muted" style={{ fontSize: 13, letterSpacing: 2 }}>
            二期 · 轻巧速占
          </span>
          <div className="line" />
        </div>
        <div className="game-grid">
          {GAMES.filter((g) => g.group === 'extra').map((g, i) => (
            <GameCard key={g.id} g={g} lit={!!seals[g.id]} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
