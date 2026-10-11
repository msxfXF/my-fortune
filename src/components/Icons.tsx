import type { ReactElement } from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const GAME_ICONS: Record<string, ReactElement> = {
  xiaoliuren: (
    <svg viewBox="0 0 64 64" {...S}>
      <circle cx="32" cy="32" r="22" opacity=".5" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={32 + Math.cos(a) * 22} cy={32 + Math.sin(a) * 22} r={i === 0 ? 5 : 3.2} fill={i === 0 ? 'currentColor' : 'none'} />;
      })}
      <path d="M32 32 L32 14" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  ),
  tarot: (
    <svg viewBox="0 0 64 64" {...S}>
      <rect x="14" y="8" width="30" height="46" rx="4" transform="rotate(-10 29 31)" opacity=".45" />
      <rect x="20" y="10" width="30" height="46" rx="4" />
      <path d="M35 22 l3 7 7 1-5 5 1.5 7-6.5-3.5-6.5 3.5 1.5-7-5-5 7-1z" />
    </svg>
  ),
  guanyin: (
    <svg viewBox="0 0 64 64" {...S}>
      <path d="M18 26 h28 l-3 30 h-22z" />
      <path d="M24 26 l-3-18 M30 26 l0-20 M36 26 l2-17 M41 26 l5-14" />
      <path d="M22 40 q10 6 20 0" opacity=".6" />
      <path d="M32 50 q-4-4 0-7 q4 3 0 7z" fill="currentColor" />
    </svg>
  ),
  liuyao: (
    <svg viewBox="0 0 64 64" {...S}>
      <circle cx="24" cy="36" r="16" />
      <rect x="19" y="31" width="10" height="10" />
      <circle cx="44" cy="24" r="12" opacity=".6" />
      <rect x="40.5" y="20.5" width="7" height="7" opacity=".6" />
    </svg>
  ),
  bazi: (
    <svg viewBox="0 0 64 64" {...S}>
      <circle cx="32" cy="32" r="24" />
      <ellipse cx="32" cy="32" rx="24" ry="9" transform="rotate(-25 32 32)" opacity=".7" />
      <ellipse cx="32" cy="32" rx="24" ry="9" transform="rotate(35 32 32)" opacity=".5" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
      <circle cx="52" cy="22" r="2.5" fill="currentColor" />
    </svg>
  ),
  guandi: (
    <svg viewBox="0 0 64 64" {...S}>
      <path d="M20 58 L44 10" />
      <path d="M44 10 q12 4 10 18 q-6 -6 -14 -4z" fill="currentColor" fillOpacity=".25" />
      <path d="M17 50 l10 5" />
      <circle cx="22" cy="49" r="2" fill="currentColor" />
    </svg>
  ),
  meihua: (
    <svg viewBox="0 0 64 64" {...S}>
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={32 + Math.cos((i / 5) * Math.PI * 2 - Math.PI / 2) * 11} cy={30 + Math.sin((i / 5) * Math.PI * 2 - Math.PI / 2) * 11} r="8" />
      ))}
      <circle cx="32" cy="30" r="3" fill="currentColor" />
      <path d="M32 44 q-2 8 -10 14" opacity=".6" />
    </svg>
  ),
  shengxiao: (
    <svg viewBox="0 0 64 64" {...S}>
      <circle cx="32" cy="32" r="24" />
      <circle cx="32" cy="32" r="15" opacity=".6" />
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={32 + Math.cos((i / 12) * Math.PI * 2) * 24} cy={32 + Math.sin((i / 12) * Math.PI * 2) * 24} r="2.4" fill="currentColor" />
      ))}
      <path d="M26 30 q6 -8 12 0 q-6 6 -12 0z" />
    </svg>
  ),
  chenggu: (
    <svg viewBox="0 0 64 64" {...S}>
      <path d="M6 24 L58 20" />
      <path d="M18 23 v-8" />
      <circle cx="18" cy="12" r="3" />
      <path d="M10 23 l-3 14 h10 l-3-14" opacity=".7" />
      <path d="M44 21 v12" />
      <path d="M39 33 h10 l-2 12 h-6z" fill="currentColor" fillOpacity=".25" />
    </svg>
  ),
  numerology: (
    <svg viewBox="0 0 64 64" {...S}>
      <polygon points="32,6 55,45 9,45" opacity=".7" />
      <polygon points="32,58 9,19 55,19" opacity=".7" />
      <circle cx="32" cy="32" r="26" opacity=".4" />
      <text x="32" y="38" textAnchor="middle" fontSize="16" fill="currentColor" stroke="none" fontFamily="serif">7</text>
    </svg>
  ),
  daily: (
    <svg viewBox="0 0 64 64" {...S}>
      <rect x="12" y="12" width="40" height="44" rx="5" />
      <path d="M12 24 h40" />
      <path d="M22 7 v10 M42 7 v10" />
      <text x="32" y="47" textAnchor="middle" fontSize="18" fill="currentColor" stroke="none" fontFamily="serif">吉</text>
    </svg>
  ),
};

export const UiIcon = {
  seal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9z" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21V5M9 8h6M9 12h6" />
    </svg>
  ),
  soundOn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10v4h4l5 4V6L8 10z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  ),
  soundOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10v4h4l5 4V6L8 10z" />
      <path d="M17 10l4 4M21 10l-4 4" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  replay: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  ),
};
