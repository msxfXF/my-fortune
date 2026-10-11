import type { ReactNode } from 'react';
import type { Tone } from '../lib/tone';
import { UiIcon } from './Icons';

interface Props {
  tone: Tone;
  kicker: string;
  title: string;
  subtitle?: ReactNode;
  badge?: { text: string; small?: string };
  poem?: string[];
  children?: ReactNode;
  onReplay?: () => void;
  replayLabel?: string;
}

export function Poem({ lines, delay = 0.5 }: { lines: string[]; delay?: number }) {
  let n = 0;
  return (
    <div className="poem">
      {lines.map((line, i) => (
        <span className="pl" key={i}>
          {line.split('').map((c, j) => (
            <span className="ch" key={j} style={{ animationDelay: `${delay + n++ * 0.05}s` }}>
              {c}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="stars" aria-label={`${value} 星`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? '' : 'off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ResultCard({ tone, kicker, title, subtitle, badge, poem, children, onReplay, replayLabel = '再问一次' }: Props) {
  return (
    <section className={`result-card tone-${tone}`} aria-live="polite">
      <div className="rc-head">
        <div>
          <div className="rc-kicker">{kicker}</div>
          <h2 className="rc-title">{title}</h2>
          {subtitle && <div className="rc-subtitle">{subtitle}</div>}
        </div>
        {badge && (
          <div className="level-badge">
            {badge.text}
            {badge.small && <small>{badge.small}</small>}
          </div>
        )}
      </div>
      {poem && <Poem lines={poem} />}
      {children && <div className="rc-body">{children}</div>}
      <div className="rc-foot">
        <span className="disclaimer">结果仅供娱乐，切勿迷信</span>
        {onReplay && (
          <button className="btn" onClick={onReplay}>
            <span style={{ width: 18, height: 18, display: 'inline-flex' }}>{UiIcon.replay}</span>
            {replayLabel}
          </button>
        )}
      </div>
    </section>
  );
}
