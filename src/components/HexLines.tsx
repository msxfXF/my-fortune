import type { Line } from '../lib/hexagram';

/** 自下而上绘制卦画；moving 为动爻下标 */
export default function HexLines({ lines, moving = [], size = 120, lit = 6, className }: { lines: Line[]; moving?: number[]; size?: number; lit?: number; className?: string }) {
  const h = size * 0.86;
  const gap = h / 6;
  const bar = gap * 0.52;
  return (
    <svg className={className} width={size} height={h} viewBox={`0 0 ${size} ${h}`} aria-hidden>
      {lines.map((l, i) => {
        const y = h - (i + 1) * gap + (gap - bar) / 2;
        const on = i < lit;
        const color = moving.includes(i) ? 'var(--gold-hi)' : 'var(--gold)';
        const style = { opacity: on ? 1 : 0.12, filter: on ? 'drop-shadow(0 0 6px rgba(255,196,92,.6))' : 'none', transition: 'opacity .5s, filter .5s' };
        return l ? (
          <rect key={i} x={0} y={y} width={size} height={bar} rx={2} fill={color} style={style} />
        ) : (
          <g key={i} style={style}>
            <rect x={0} y={y} width={size * 0.42} height={bar} rx={2} fill={color} />
            <rect x={size * 0.58} y={y} width={size * 0.42} height={bar} rx={2} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}
