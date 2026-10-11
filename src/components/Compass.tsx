import { BRANCHES, STEMS } from '../lib/calendar';
import { TRIGRAMS } from '../lib/hexagram';

/** 装饰性罗盘：八卦、天干、地支、刻度多层反向旋转 */
export default function Compass({ className }: { className?: string }) {
  const ticks = Array.from({ length: 120 });
  return (
    <svg className={className} viewBox="-300 -300 600 600" aria-hidden>
      <defs>
        <radialGradient id="cmp-glow">
          <stop offset="0%" stopColor="rgba(255,214,140,0.25)" />
          <stop offset="60%" stopColor="rgba(255,214,140,0.04)" />
          <stop offset="100%" stopColor="rgba(255,214,140,0)" />
        </radialGradient>
      </defs>
      <circle r="290" fill="url(#cmp-glow)" />
      <g className="spin-slow" style={{ transformOrigin: '0 0' }}>
        <circle r="286" fill="none" stroke="rgba(232,194,122,0.35)" strokeWidth="1" />
        <circle r="270" fill="none" stroke="rgba(232,194,122,0.2)" strokeWidth="1" />
        {ticks.map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={-286}
            x2="0"
            y2={i % 10 === 0 ? -266 : -276}
            stroke="rgba(232,194,122,0.45)"
            strokeWidth={i % 10 === 0 ? 1.4 : 0.6}
            transform={`rotate(${i * 3})`}
          />
        ))}
        {BRANCHES.map((b, i) => (
          <text key={b} y={-240} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * 30})`} fill="rgba(255,226,163,0.75)" fontSize="22" fontFamily="var(--font-title)">
            {b}
          </text>
        ))}
        <circle r="218" fill="none" stroke="rgba(232,194,122,0.25)" strokeDasharray="2 6" />
      </g>
      <g className="spin-rev" style={{ transformOrigin: '0 0' }}>
        {STEMS.map((s, i) => (
          <text key={s} y={-190} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * 36 + 18})`} fill="rgba(169,179,255,0.6)" fontSize="18" fontFamily="var(--font-title)">
            {s}
          </text>
        ))}
        <circle r="166" fill="none" stroke="rgba(117,132,255,0.25)" />
        {TRIGRAMS.map((t, i) => (
          <g key={t.name} transform={`rotate(${i * 45}) translate(0 -132)`}>
            {t.lines
              .slice()
              .reverse()
              .map((l, j) =>
                l ? (
                  <rect key={j} x={-16} y={j * 8 - 10} width={32} height={4} rx={1} fill="rgba(232,194,122,0.6)" />
                ) : (
                  <g key={j}>
                    <rect x={-16} y={j * 8 - 10} width={13} height={4} rx={1} fill="rgba(232,194,122,0.6)" />
                    <rect x={3} y={j * 8 - 10} width={13} height={4} rx={1} fill="rgba(232,194,122,0.6)" />
                  </g>
                ),
              )}
          </g>
        ))}
        <circle r="100" fill="none" stroke="rgba(232,194,122,0.25)" />
      </g>
      <g className="spin-slow" style={{ transformOrigin: '0 0' }}>
        <path d="M0,-86 A43,43 0 0 1 0,0 A43,43 0 0 0 0,86 A86,86 0 0 1 0,-86 Z" fill="rgba(232,194,122,0.2)" />
        <path d="M0,-86 A86,86 0 0 0 0,86 A43,43 0 0 1 0,0 A43,43 0 0 0 0,-86 Z" fill="rgba(117,132,255,0.12)" />
        <circle r="86" fill="none" stroke="rgba(232,194,122,0.4)" />
        <circle cy={-43} r="9" fill="rgba(117,132,255,0.45)" />
        <circle cy={43} r="9" fill="rgba(232,194,122,0.55)" />
      </g>
    </svg>
  );
}
