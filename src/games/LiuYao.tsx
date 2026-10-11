import { useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import HexLines from '../components/HexLines';
import ResultCard from '../components/ResultCard';
import { BRANCH_ELEMENT, nowLunar, relation } from '../lib/calendar';
import { changeLines, hexagramByLines, levelTone, najia, palaceOf, sixGods, type Kin, type Line } from '../lib/hexagram';
import { flip } from '../lib/random';
import { sfx } from '../lib/sound';
import { recordResult } from '../lib/storage';
import type { Tone } from '../lib/tone';
import './liuyao.css';

interface Toss {
  coins: boolean[];
  value: 6 | 7 | 8 | 9;
}

const YAO_NAME = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
const VALUE_NAME: Record<number, string> = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' };
const KIN_SHI: Record<Kin, string> = {
  兄弟: '主竞争与开销，求财宜谨慎，合作需分清权责。',
  子孙: '主安乐与福气，忧虑可解，利于休养与创作。',
  妻财: '主财物与实务，求财有望，凡事务实可成。',
  官鬼: '主压力与事业，或有忧疑之事，宜稳中求进。',
  父母: '主文书与辛劳，利于考试、签约与长辈相关之事。',
};
const KIN_MOVE: Record<Kin, string> = {
  兄弟: '竞争或破耗之变',
  子孙: '喜悦临门、忧患化解',
  妻财: '财务变动、利于求财',
  官鬼: '压力或事业有变',
  父母: '文书消息或长辈之事',
};
const LEVEL_SCORE = { 大吉: 2, 吉: 1, 平: 0, 凶: -1.5 } as const;

/** 按文档规则：三正老阳、三反老阴、两正一反少阳、两反一正少阴 */
function judge(coins: boolean[]): Toss['value'] {
  const heads = coins.filter(Boolean).length;
  return heads === 3 ? 9 : heads === 0 ? 6 : heads === 2 ? 7 : 8;
}

function Coin({ index, face, tossKey }: { index: number; face: boolean | null; tossKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  useEffect(() => {
    if (face === null || !ref.current) return;
    const turns = 4 + Math.floor(Math.random() * 4);
    const start = angle.current % 360;
    const end = start + turns * 360 + (((face ? 0 : 180) - start) % 360 + 360) % 360;
    angle.current = end;
    const dx = (Math.random() - 0.5) * 30;
    const dur = 950 + Math.random() * 350 + index * 80;
    ref.current.animate(
      [
        { transform: `translate(0px, 0px) rotateX(${start}deg) scale(1)` },
        { transform: `translate(${dx / 2}px, -190px) rotateX(${(start + end) / 2}deg) scale(1.18)`, offset: 0.42 },
        { transform: `translate(${dx}px, 0px) rotateX(${end}deg) scale(1)`, offset: 0.78 },
        { transform: `translate(${dx}px, -16px) rotateX(${end}deg) scale(1.02)`, offset: 0.88 },
        { transform: `translate(${dx}px, 0px) rotateX(${end}deg) scale(1)` },
      ],
      { duration: dur, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' },
    );
    shadow.current?.animate(
      [{ transform: 'scale(1)', opacity: 0.6 }, { transform: 'scale(0.45)', opacity: 0.2, offset: 0.42 }, { transform: 'scale(1)', opacity: 0.6, offset: 0.78 }, { transform: 'scale(1)', opacity: 0.6 }],
      { duration: dur, fill: 'forwards' },
    );
    const t1 = setTimeout(() => sfx.coin(), dur * 0.78);
    const t2 = setTimeout(() => sfx.coin(), dur * 0.98);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tossKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ly-coin-slot">
      <div ref={shadow} className="ly-coin-shadow" />
      <div ref={ref} className="ly-coin">
        <div className="coin-face front">
          <span className="ct t">云</span>
          <span className="ct b">卜</span>
          <span className="ct r">通</span>
          <span className="ct l">宝</span>
          <i className="hole" />
        </div>
        <div className="coin-face back">
          <span className="ct t">☰</span>
          <span className="ct b">☷</span>
          <i className="hole" />
        </div>
      </div>
    </div>
  );
}

export default function LiuYao() {
  const [question, setQuestion] = useState('');
  const [tosses, setTosses] = useState<Toss[]>([]);
  const [current, setCurrent] = useState<boolean[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [tossKey, setTossKey] = useState(0);
  const [auto, setAuto] = useState(false);
  const timers = useRef<number[]>([]);
  const tossesRef = useRef<Toss[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const lunar = useMemo(() => nowLunar(), []);
  const done = tosses.length === 6;

  const throwOnce = (chain = false) => {
    if (busy && !chain) return;
    setBusy(true);
    const coins = [flip(), flip(), flip()];
    setCurrent(coins);
    setTossKey((k) => k + 1);
    later(() => {
      const next = [...tossesRef.current, { coins, value: judge(coins) }];
      tossesRef.current = next;
      setTosses(next);
      if (next.length === 6) later(() => finish(next), 700);
      else if (chain) later(() => throwOnce(true), 450);
      else setBusy(false);
    }, 1500);
  };

  const finish = (all: Toss[]) => {
    setBusy(false);
    sfx.chime();
    const lines = all.map((t) => (t.value === 7 || t.value === 9 ? 1 : 0)) as Line[];
    const moving = all.flatMap((t, i) => (t.value === 6 || t.value === 9 ? [i] : []));
    const ben = hexagramByLines(lines);
    const bian = moving.length ? changeLines(ben, moving) : null;
    recordResult({
      game: 'liuyao',
      title: bian ? `${ben.fullName} 之 ${bian.fullName}` : `${ben.fullName}（静卦）`,
      summary: `${question ? `问「${question}」· ` : ''}${ben.judgement}`,
      tone: levelTone(ben.level),
    });
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    tossesRef.current = [];
    setTosses([]);
    setCurrent(null);
    setBusy(false);
  };

  const analysis = useMemo(() => {
    if (!done) return null;
    const lines = tosses.map((t) => (t.value === 7 || t.value === 9 ? 1 : 0)) as Line[];
    const moving = tosses.flatMap((t, i) => (t.value === 6 || t.value === 9 ? [i] : []));
    const ben = hexagramByLines(lines);
    const bian = moving.length ? changeLines(ben, moving) : null;
    const pal = palaceOf(ben);
    const nj = najia(ben);
    const bnj = bian ? najia(bian, pal.palace) : null;
    const gods = sixGods(lunar.getDayGan());
    const xunkong = lunar.getDayXunKong();
    const monthZhi = lunar.getMonthZhi();
    const monthEl = BRANCH_ELEMENT[monthZhi];
    const shi = nj[pal.shi - 1];
    const rel = relation(monthEl, shi.element);

    const notes: string[] = [];
    if (!moving.length) notes.push('六爻安静，以本卦卦辞为断：事态趋于稳定，短期内不会有大的变化。');
    else if (moving.length === 1) {
      const m = nj[moving[0]];
      notes.push(`${YAO_NAME[moving[0]]}独发，事之关键在此：${m.kin}${m.branch}${m.element}动，主${KIN_MOVE[m.kin]}。`);
    } else if (moving.length >= 4) notes.push(`${moving.length} 爻齐动，局势变化较大，当以变卦「${bian!.fullName}」为主要参考。`);
    else notes.push(`${moving.length} 爻发动，事有转折，需兼看本卦与变卦。`);
    notes.push(`世爻在${YAO_NAME[pal.shi - 1]}，持${shi.kin}${shi.branch}${shi.element}，${KIN_SHI[shi.kin]}`);
    if (rel === '生我' || rel === '比和') notes.push(`月建${monthZhi}${monthEl}${rel === '比和' ? '与世爻比和' : '生扶世爻'}，自身有力，所谋易成。`);
    else if (rel === '克我') notes.push(`月建${monthZhi}${monthEl}克制世爻，自身力量偏弱，宜借助外力、稳步推进。`);
    else notes.push(`月建${monthZhi}${monthEl}与世爻${rel === '我生' ? '相泄' : '相耗'}，需量力而行，不宜贪多。`);
    if (xunkong.includes(shi.branch)) notes.push(`世爻${shi.branch}落旬空（${xunkong}），心中尚有犹豫或事情尚虚，待出空之时方见分晓。`);
    if (bian) {
      const a = LEVEL_SCORE[ben.level];
      const b = LEVEL_SCORE[bian.level];
      notes.push(b > a ? '由本卦至变卦，渐入佳境，结果优于开端。' : b < a ? '由本卦至变卦，先顺后阻，宜防后劲不足、未雨绸缪。' : '本卦与变卦气象相当，事情将平稳延续。');
    }
    const score = LEVEL_SCORE[ben.level] + (bian ? LEVEL_SCORE[bian.level] * 0.8 : 0) + (rel === '生我' || rel === '比和' ? 0.5 : rel === '克我' ? -0.5 : 0);
    const tone: Tone = score >= 0.8 ? 'ji' : score <= -0.8 ? 'xiong' : 'ping';
    const verdict = score >= 2 ? '大吉' : score >= 0.8 ? '吉' : score <= -1.5 ? '凶' : score <= -0.8 ? '小凶' : '平';
    return { lines, moving, ben, bian, pal, nj, bnj, gods, xunkong, notes, tone, verdict, monthZhi };
  }, [done, tosses, lunar]);

  const last = tosses[tosses.length - 1];

  return (
    <GameShell id="liuyao">
      <div className="panel stage panel-corners fade-up">
        <div className="stage-center">
          {tosses.length === 0 && !busy && (
            <input className="input" style={{ width: 'min(420px, 100%)', textAlign: 'center' }} placeholder="心中所问之事（可不填）" value={question} maxLength={30} onChange={(e) => setQuestion(e.target.value)} />
          )}
          <div className="ly-layout">
            <div className="ly-tray">
              <div className="ly-coins">
                {[0, 1, 2].map((i) => (
                  <Coin key={i} index={i} face={current ? current[i] : null} tossKey={tossKey} />
                ))}
              </div>
              <div className="ly-toss-info">
                {last && !busy ? (
                  <>
                    第 {tosses.length} 掷：{last.coins.map((c) => (c ? '正' : '反')).join(' ')} → <b>{VALUE_NAME[last.value]}</b>
                    {(last.value === 6 || last.value === 9) && <span className="ly-moving-tag">动</span>}
                  </>
                ) : busy ? (
                  '铜钱翻飞…'
                ) : (
                  '三枚铜钱，连掷六次，自下而上成卦'
                )}
              </div>
            </div>

            <div className="ly-rack">
              <div className="ly-rack-title">卦 架</div>
              {[5, 4, 3, 2, 1, 0].map((i) => {
                const t = tosses[i];
                return (
                  <div key={i} className={`ly-row${t ? ' on' : ''}${i === tosses.length && busy ? ' pending' : ''}`}>
                    <span className="ly-yname">{YAO_NAME[i]}</span>
                    <span className={`ly-bar ${t ? (t.value === 7 || t.value === 9 ? 'yang' : 'yin') : 'blank'}`}>
                      <i />
                      <i />
                    </span>
                    <span className="ly-mark">{t ? (t.value === 9 ? '○' : t.value === 6 ? '×' : '') : ''}</span>
                    <span className="ly-vname">{t ? VALUE_NAME[t.value] : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {!done && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => (auto ? throwOnce(true) : throwOnce())}>
                {tosses.length === 0 ? '掷 钱' : `再掷（${tosses.length}/6）`}
              </button>
              {tosses.length === 0 && (
                <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> 一键连掷六次
                </label>
              )}
            </div>
          )}

          {done && analysis && (
            <div className="ly-formed fade-up">
              <div className="ly-formed-hex">
                <HexLines lines={analysis.ben.lines} moving={analysis.moving} size={110} />
                <div className="calligraphy gold-text ly-formed-name">{analysis.ben.fullName}</div>
                <div className="muted">本卦 · {analysis.pal.palace.name}宫{analysis.pal.kind}</div>
              </div>
              {analysis.bian && (
                <>
                  <div className="ly-arrow">之</div>
                  <div className="ly-formed-hex">
                    <HexLines lines={analysis.bian.lines} size={110} />
                    <div className="calligraphy gold-text ly-formed-name">{analysis.bian.fullName}</div>
                    <div className="muted">变卦 · {palaceOf(analysis.bian).palace.name}宫{palaceOf(analysis.bian).kind}</div>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="rule-note">三正为老阳（○ 动）、三反为老阴（× 动）、两正一反为少阳、两反一正为少阴。动爻阴阳互变而成变卦。</div>
        </div>
      </div>

      {done && analysis && (
        <ResultCard
          tone={analysis.tone}
          kicker={`六爻 · ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 · 旬空 ${analysis.xunkong}`}
          title={analysis.ben.fullName}
          subtitle={analysis.bian ? `之「${analysis.bian.fullName}」· 动爻 ${analysis.moving.map((m) => YAO_NAME[m]).join('、')}` : '六爻安静 · 静卦'}
          badge={{ text: analysis.verdict, small: '简断' }}
          onReplay={reset}
          replayLabel="重新起卦"
        >
          {question && <div className="muted" style={{ letterSpacing: 2 }}>所问：{question}</div>}
          <h4>卦辞</h4>
          <div className="rc-plain">
            <div className="calligraphy" style={{ fontSize: 22, color: 'var(--accent-hi)', marginBottom: 6 }}>
              {analysis.ben.judgement}
            </div>
            {analysis.ben.plain}
          </div>
          {analysis.bian && (
            <>
              <h4>变卦 · {analysis.bian.fullName}</h4>
              <div className="rc-plain">
                {analysis.bian.judgement} {analysis.bian.plain}
              </div>
            </>
          )}
          <h4>排盘</h4>
          <div className="ly-table-wrap">
            <table className="ly-table">
              <thead>
                <tr>
                  <th>六神</th>
                  <th>本卦</th>
                  <th>六亲 · 纳甲</th>
                  <th>世应</th>
                  {analysis.bian && <th>变卦</th>}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1, 0].map((i) => {
                  const l = analysis.nj[i];
                  const mv = analysis.moving.includes(i);
                  const t = tosses[i];
                  return (
                    <tr key={i} className={mv ? 'mv' : ''}>
                      <td>{analysis.gods[i]}</td>
                      <td>
                        <span className={`ly-bar mini ${analysis.ben.lines[i] ? 'yang' : 'yin'}`}>
                          <i />
                          <i />
                        </span>
                        <span className="ly-mark">{t.value === 9 ? '○' : t.value === 6 ? '×' : ''}</span>
                      </td>
                      <td>
                        {l.kin} {l.stem}
                        {l.branch}
                        {l.element}
                      </td>
                      <td className="ly-sy">{analysis.pal.shi === i + 1 ? '世' : analysis.pal.ying === i + 1 ? '应' : ''}</td>
                      {analysis.bian && (
                        <td>
                          {mv && analysis.bnj ? (
                            <>
                              <span className={`ly-bar mini ${analysis.bian.lines[i] ? 'yang' : 'yin'}`}>
                                <i />
                                <i />
                              </span>{' '}
                              {analysis.bnj[i].kin} {analysis.bnj[i].branch}
                              {analysis.bnj[i].element}
                            </>
                          ) : (
                            <span className={`ly-bar mini dim ${analysis.bian.lines[i] ? 'yang' : 'yin'}`}>
                              <i />
                              <i />
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h4>简断</h4>
          <ul className="ly-notes">
            {analysis.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </ResultCard>
      )}
    </GameShell>
  );
}
