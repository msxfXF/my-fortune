import { useEffect, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import ResultCard, { Poem } from '../components/ResultCard';
import { ROMAN, TAROT, type TarotCard, type TarotLevel } from '../data/tarot';
import { flip, shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import type { Tone } from '../lib/tone';
import './tarot.css';

type Stage = 'ready' | 'shuffling' | 'spread' | 'reveal' | 'done';
interface DeckCard {
  card: TarotCard;
  reversed: boolean;
}

const LEVEL_SCORE: Record<TarotLevel, number> = { 大吉: 2, 吉: 1, 中平: 0, 小凶: -1, 凶: -2, 大凶: -3 };
const levelTone = (l: TarotLevel): Tone => (LEVEL_SCORE[l] > 0 ? 'ji' : LEVEL_SCORE[l] === 0 ? 'ping' : 'xiong');
const POSITIONS = ['过去', '现在', '未来'];

export function CardFace({ card }: { card: TarotCard }) {
  return (
    <svg viewBox="0 0 120 200" className="tc-svg">
      <defs>
        <linearGradient id={`tf-${card.no}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1f45" />
          <stop offset="1" stopColor="#120d22" />
        </linearGradient>
        <radialGradient id={`tg-${card.no}`}>
          <stop offset="0" stopColor="rgba(255,214,140,.55)" />
          <stop offset="1" stopColor="rgba(255,214,140,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="120" height="200" rx="9" fill={`url(#tf-${card.no})`} />
      <rect x="5" y="5" width="110" height="190" rx="6" fill="none" stroke="#e8c27a" strokeWidth="1.2" />
      <rect x="9" y="9" width="102" height="182" rx="4" fill="none" stroke="#e8c27a" strokeWidth=".5" opacity=".6" />
      <text x="60" y="27" textAnchor="middle" fill="#e8c27a" fontSize="12" fontFamily="serif" letterSpacing="2">{ROMAN[card.no]}</text>
      <circle cx="60" cy="95" r="44" fill={`url(#tg-${card.no})`} />
      <circle cx="60" cy="95" r="36" fill="none" stroke="#e8c27a" strokeWidth=".6" opacity=".7" />
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={i} x1="60" y1="51" x2="60" y2={i % 2 ? 56 : 59} stroke="#e8c27a" strokeWidth=".8" transform={`rotate(${i * 22.5} 60 95)`} opacity=".8" />
      ))}
      <text x="60" y="110" textAnchor="middle" fill="#ffe2a3" fontSize="40" fontFamily="'Segoe UI Symbol','Noto Sans Symbols 2','Noto Sans Symbols','Apple Symbols',serif">{card.glyph + '︎'}</text>
      <text x="60" y="164" textAnchor="middle" fill="#f3ead7" fontSize="19" fontFamily="var(--font-title)" letterSpacing="3">{card.name}</text>
      <text x="60" y="181" textAnchor="middle" fill="#9a9081" fontSize="7.5" fontFamily="serif" letterSpacing="1">{card.en.toUpperCase()}</text>
    </svg>
  );
}

function CardBack() {
  return (
    <svg viewBox="0 0 120 200" className="tc-svg">
      <defs>
        <pattern id="tb-pat" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="#1a1233" />
          <path d="M0 6h12M6 0v12" stroke="rgba(232,194,122,.14)" strokeWidth=".6" />
        </pattern>
      </defs>
      <rect width="120" height="200" rx="9" fill="url(#tb-pat)" />
      <rect x="5" y="5" width="110" height="190" rx="6" fill="none" stroke="#e8c27a" strokeWidth="1.2" />
      <circle cx="60" cy="100" r="30" fill="none" stroke="#e8c27a" strokeWidth=".9" />
      <circle cx="60" cy="100" r="22" fill="#120d22" stroke="#e8c27a" strokeWidth=".5" />
      <path d="M60 80 L64 96 L80 100 L64 104 L60 120 L56 104 L40 100 L56 96Z" fill="#e8c27a" opacity=".85" />
      <path d="M60 30 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z" fill="#a9b3ff" opacity=".7" />
      <circle cx="60" cy="162" r="7" fill="none" stroke="#e8c27a" />
      <circle cx="60" cy="162" r="2.5" fill="#e8c27a" />
    </svg>
  );
}

export default function Tarot() {
  const [mode, setMode] = useState<1 | 3>(1);
  const [stage, setStage] = useState<Stage>('ready');
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [flipped, setFlipped] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const doShuffle = () => {
    setStage('shuffling');
    setPicked([]);
    setFlipped(0);
    setDeck(shuffle(TAROT).map((card) => ({ card, reversed: flip() })));
    for (let i = 0; i < 6; i++) later(() => sfx.paper(), i * 260);
    later(() => setStage('spread'), 1700);
  };

  const pick = (i: number) => {
    if (stage !== 'spread' || picked.includes(i) || picked.length >= mode) return;
    sfx.whoosh();
    const next = [...picked, i];
    setPicked(next);
    if (next.length === mode) {
      later(() => setStage('reveal'), 500);
      next.forEach((_, k) =>
        later(() => {
          setFlipped(k + 1);
          sfx.chime();
        }, 1300 + k * 900),
      );
      later(() => {
        setStage('done');
        const cards = next.map((n) => deck[n]);
        const readings = cards.map((c) => (c.reversed ? c.card.reversed : c.card.upright));
        const score = readings.reduce((s, r) => s + LEVEL_SCORE[r.level], 0);
        const tone: Tone = mode === 1 ? levelTone(readings[0].level) : score > 0 ? 'ji' : score === 0 ? 'ping' : 'xiong';
        recordResult({
          game: 'tarot',
          title: cards.map((c) => `${c.card.name}${c.reversed ? '(逆)' : ''}`).join(' · '),
          summary: mode === 1 ? readings[0].plain : `三张牌阵：${cards.map((c, k) => `${POSITIONS[k]}${c.card.name}`).join('，')}`,
          tone,
        });
      }, 1300 + mode * 900 + 300);
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage('ready');
    setPicked([]);
    setFlipped(0);
  };

  const chosen = picked.map((i) => deck[i]);

  return (
    <GameShell id="tarot">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          {stage === 'ready' && (
            <div className="segmented">
              <button className={mode === 1 ? 'active' : ''} onClick={() => setMode(1)}>单张 · 一问一答</button>
              <button className={mode === 3 ? 'active' : ''} onClick={() => setMode(3)}>三张 · 过去现在未来</button>
            </div>
          )}

          {(stage === 'ready' || stage === 'shuffling') && (
            <div className={`tarot-deck${stage === 'shuffling' ? ' shuffling' : ''}`}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="tcard deck-card" style={{ '--i': i } as React.CSSProperties}>
                  <div className="tc-inner">
                    <div className="tc-back"><CardBack /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stage === 'spread' && (
            <>
              <div className="hint">凭直觉，从牌阵中选出 {mode} 张牌（已选 {picked.length}/{mode}）</div>
              <div className="tarot-fan">
                {deck.map((d, i) => {
                  return (
                    <button
                      key={d.card.no}
                      className={`tcard fan-card${picked.includes(i) ? ' taken' : ''}`}
                      style={{ '--k': i - (deck.length - 1) / 2, '--d': `${i * 0.03}s` } as React.CSSProperties}
                      onClick={() => pick(i)}
                      aria-label={`第 ${i + 1} 张牌`}
                    >
                      <div className="tc-inner">
                        <div className="tc-back"><CardBack /></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {(stage === 'spread' || stage === 'reveal' || stage === 'done') && picked.length > 0 && (
            <div className="tarot-slots">
              {chosen.map((d, k) => (
                <div className="tarot-slot" key={k}>
                  {mode === 3 && <div className="slot-label">{POSITIONS[k]}</div>}
                  <div className={`tcard slot-card${flipped > k ? ' flipped' : ''}${d.reversed ? ' reversed' : ''}`}>
                    <div className="tc-inner">
                      <div className="tc-back"><CardBack /></div>
                      <div className="tc-face"><CardFace card={d.card} /></div>
                    </div>
                  </div>
                  {flipped > k && (
                    <div className="slot-caption fade-up">
                      {d.card.name} · {d.reversed ? '逆位' : '正位'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {stage === 'ready' && (
            <button className="btn btn-primary btn-lg" onClick={doShuffle}>
              洗牌 · 展开牌阵
            </button>
          )}
          {stage === 'shuffling' && <div className="hint">洗牌中，请在心中默念你的问题…</div>}
          <div className="rule-note">22 张大阿卡纳等概率抽取，每张独立掷定正逆位（各 50%），共 44 种结果。</div>
        </div>
      </div>

      {stage === 'done' && mode === 1 && chosen[0] && (() => {
        const d = chosen[0];
        const r = d.reversed ? d.card.reversed : d.card.upright;
        return (
          <ResultCard
            tone={levelTone(r.level)}
            kicker={`塔罗 · ${ROMAN[d.card.no]} · ${d.card.en}`}
            title={d.card.name}
            subtitle={`${d.reversed ? '逆位' : '正位'} · ${d.card.keywords}`}
            badge={{ text: r.level, small: d.reversed ? '逆位' : '正位' }}
            poem={r.verse}
            onReplay={reset}
            replayLabel="重新洗牌"
          >
            <div className="rc-plain">{r.plain}</div>
          </ResultCard>
        );
      })()}

      {stage === 'done' && mode === 3 && (() => {
        const readings = chosen.map((d) => (d.reversed ? d.card.reversed : d.card.upright));
        const score = readings.reduce((s, r) => s + LEVEL_SCORE[r.level], 0);
        const tone: Tone = score > 0 ? 'ji' : score === 0 ? 'ping' : 'xiong';
        const trend = LEVEL_SCORE[readings[2].level] - LEVEL_SCORE[readings[0].level];
        return (
          <ResultCard
            tone={tone}
            kicker="塔罗 · 时间之流牌阵"
            title="过去 · 现在 · 未来"
            subtitle={trend > 0 ? '整体走势：渐入佳境，越往后越顺' : trend < 0 ? '整体走势：先顺后阻，宜未雨绸缪' : '整体走势：平稳延续，关键在当下'}
            badge={{ text: tone === 'ji' ? '吉' : tone === 'ping' ? '平' : '慎', small: '总评' }}
            onReplay={reset}
            replayLabel="重新洗牌"
          >
            {chosen.map((d, k) => {
              const r = readings[k];
              return (
                <div key={k} className={`tarot-reading tone-${levelTone(r.level)}`}>
                  <h4>
                    {POSITIONS[k]} · {d.card.name} · {d.reversed ? '逆位' : '正位'} · {r.level}
                  </h4>
                  <Poem lines={r.verse} delay={0.4 + k * 0.5} />
                  <div className="rc-plain">{r.plain}</div>
                </div>
              );
            })}
          </ResultCard>
        );
      })()}
    </GameShell>
  );
}
