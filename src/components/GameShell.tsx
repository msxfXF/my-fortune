import type { ReactNode } from 'react';
import { GAME_BY_ID } from '../games/meta';
import { UiIcon } from './Icons';

export default function GameShell({ id, children }: { id: string; children: ReactNode }) {
  const meta = GAME_BY_ID[id];
  return (
    <div className="container game-page">
      <header className="game-head fade-up">
        <a className="icon-btn back-link" href="#/">
          {UiIcon.back}
          <span className="label">回大殿</span>
        </a>
        <div className="eyebrow">{meta.tagline}</div>
        <h1 className="gold-text">{meta.name}</h1>
        <p>{meta.desc}</p>
      </header>
      {children}
    </div>
  );
}
