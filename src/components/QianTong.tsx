import { useCallback, useEffect, useRef, useState } from 'react';
import { ASK_TOPICS, LOT_LEVEL_TONE, TOPIC_ADVICE, type AskTopic, type Lot } from '../data/lots';
import { cnNumber } from '../lib/calendar';
import { randInt } from '../lib/random';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import ResultCard from './ResultCard';
import './qiantong.css';

interface Props {
  game: string;
  libName: string;
  lots: Lot[];
  theme: 'guanyin' | 'guandi';
  tubeLabel: string;
}

type Stage = 'idle' | 'charging' | 'flying' | 'landed' | 'done';
const STICKS = 26;

/** 签筒：按住蓄力摇晃，松手落签 */
export default function QianTong({ game, libName, lots, theme, tubeLabel }: Props) {
  const [topic, setTopic] = useState<AskTopic>('综合');
  const [stage, setStage] = useState<Stage>('idle');
  const [lot, setLot] = useState<Lot | null>(null);
  const [weak, setWeak] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tubeRef = useRef<HTMLDivElement>(null);
  const stickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const charge = useRef(0);
  const charging = useRef(false);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const stickSeeds = useRef(Array.from({ length: STICKS }, (_, i) => ({ x: (i / (STICKS - 1) - 0.5) * 66, r: (Math.random() - 0.5) * 14, h: Math.random() * 26, p: Math.random() * 6 })));

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const animate = useCallback(() => {
    let last = performance.now();
    let nextClack = 0;
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      if (charging.current) charge.current = Math.min(1, charge.current + dt / 1700);
      else charge.current = Math.max(0, charge.current - dt / 260);
      const c = charge.current;
      const t = now / 1000;
      const amp = c * 11;
      const rot = Math.sin(t * (14 + c * 10)) * amp;
      const dy = Math.abs(Math.sin(t * (14 + c * 10))) * c * -10;
      if (tubeRef.current) tubeRef.current.style.transform = `translateY(${dy}px) rotate(${rot}deg)`;
      sceneRef.current?.parentElement?.style.setProperty('--charge', c.toFixed(3));
      stickRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = stickSeeds.current[i];
        const j = Math.sin(t * (22 + i) + s.p) * c * 12;
        el.style.transform = `translateX(${s.x}px) translateY(${-s.h - Math.max(0, j)}px) rotate(${s.r + j * 0.6}deg)`;
      });
      if (c > 0.05 && now > nextClack) {
        sfx.clack();
        nextClack = now + 220 - c * 170 + Math.random() * 60;
      }
      if (charging.current || c > 0) raf.current = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const press = () => {
    if (stage !== 'idle') return;
    setWeak(false);
    charging.current = true;
    setStage('charging');
    animate();
  };

  const release = () => {
    if (!charging.current) return;
    charging.current = false;
    const c = charge.current;
    if (c < 0.3) {
      setWeak(true);
      setStage('idle');
      return;
    }
    const picked = lots[randInt(lots.length)];
    setLot(picked);
    setStage('flying');
    sfx.whoosh();
    later(() => {
      sfx.clack();
      setStage('landed');
    }, 1150);
    later(() => {
      setStage('done');
      sfx.chime();
      recordResult({ game, title: `第${cnNumber(picked.no)}签 · ${picked.title} · ${picked.level}`, summary: picked.interp, tone: LOT_LEVEL_TONE[picked.level] });
    }, 2100);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        press();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') release();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  });

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage('idle');
    setLot(null);
    charge.current = 0;
  };

  const tone = lot ? LOT_LEVEL_TONE[lot.level] : 'ji';

  return (
    <>
      <div className={`panel stage panel-corners fade-up qt-${theme}`}>
        <div className="stage-center">
          <div className="qt-topics">
            <span className="muted" style={{ fontSize: 13, letterSpacing: 2 }}>所问之事</span>
            <div className="segmented">
              {ASK_TOPICS.map((t) => (
                <button key={t} className={topic === t ? 'active' : ''} onClick={() => stage === 'idle' && setTopic(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div ref={sceneRef} className={`qt-scene stage-${stage}`}>
            <div className="qt-halo" />
            <div
              className="qt-tube-wrap"
              onPointerDown={(e) => {
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                press();
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onContextMenu={(e) => e.preventDefault()}
              role="button"
              aria-label="按住摇签筒"
            >
              <div ref={tubeRef} className="qt-tube">
                <div className="qt-mouth" />
                <div className="qt-sticks">
                  {stickSeeds.current.map((sd, i) => (
                    <div key={i} ref={(el) => {
                        stickRefs.current[i] = el;
                      }} className="qt-stick" style={{ zIndex: i % 3, transform: `translateX(${sd.x}px) translateY(${-sd.h}px) rotate(${sd.r}deg)` }} />
                  ))}
                </div>
                <div className="qt-body">
                  <div className="qt-band top" />
                  <div className="qt-label">{tubeLabel}</div>
                  <div className="qt-band bottom" />
                </div>
              </div>
            </div>
            {lot && stage !== 'idle' && stage !== 'charging' && (
              <div className={`qt-flying ${stage === 'flying' ? 'fly' : 'rest'}`}>
                <span>第{cnNumber(lot.no)}签</span>
              </div>
            )}
            <div className="qt-table" />
          </div>

          {(stage === 'idle' || stage === 'charging') && (
            <button
              className="btn btn-primary btn-lg qt-btn"
              onPointerDown={press}
              onPointerUp={release}
              onPointerLeave={release}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="qt-meter" />
              {stage === 'charging' ? '摇…松手落签' : '按住摇签'}
            </button>
          )}
          <div className="hint">
            {weak ? '力道不足，签未落出，再诚心多摇一会儿' : '按住签筒或按钮蓄力摇晃，松手即落签；电脑可长按空格'}
          </div>
        </div>
      </div>

      {stage === 'done' && lot && (
        <ResultCard
          tone={tone}
          kicker={`${libName} · 第${cnNumber(lot.no)}签 · 共${lots.length}签`}
          title={lot.title}
          subtitle={`所问：${topic}`}
          badge={{ text: lot.level, small: '签等' }}
          poem={lot.poem.map((l, i) => l + (i % 2 ? '。' : '，'))}
          onReplay={reset}
          replayLabel="再求一签"
        >
          <h4>解曰</h4>
          <div className="rc-plain">{lot.interp}</div>
          {topic !== '综合' && (
            <>
              <h4>所问 · {topic}</h4>
              <div className="rc-plain">{TOPIC_ADVICE[topic][lot.level]}</div>
            </>
          )}
        </ResultCard>
      )}
    </>
  );
}
