import { Suspense, useEffect, useState } from 'react';
import Home from './Home';
import { UiIcon } from './components/Icons';
import { HistoryDrawer, SealBook, SealStamp } from './components/Overlays';
import Starfield from './components/Starfield';
import { GAME_COMPONENTS } from './games';
import { GAMES } from './games/meta';
import { setMuted, useStore } from './lib/storage';

function useHashRoute() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const m = hash.match(/^#\/game\/([\w-]+)/);
  return m && GAME_COMPONENTS[m[1]] ? { page: 'game' as const, id: m[1] } : { page: 'home' as const, id: '' };
}

function Loading() {
  return (
    <div className="empty" style={{ padding: '120px 0' }}>
      <span className="calligraphy gold-text" style={{ fontSize: 30 }}>
        焚香净手中…
      </span>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const [panel, setPanel] = useState<'seals' | 'history' | null>(null);
  const muted = useStore((s) => s.muted);
  const seals = useStore((s) => s.seals);
  const lit = GAMES.filter((g) => seals[g.id]).length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route.page, route.id]);

  const Game = route.page === 'game' ? GAME_COMPONENTS[route.id] : null;

  return (
    <>
      <Starfield />
      <header className="topbar">
        <div className="container">
          <a className="brand" href="#/">
            <div className="brand-seal">卜</div>
            <div>
              <div className="brand-name gold-text">云卜轩</div>
              <div className="brand-sub">YUN · BU · XUAN</div>
            </div>
          </a>
          <nav className="topnav">
            <button className="icon-btn" onClick={() => setPanel('seals')} aria-label="印章簿">
              {UiIcon.seal}
              <span className="label">印章</span>
              <span className="count">
                {lit}/{GAMES.length}
              </span>
            </button>
            <button className="icon-btn" onClick={() => setPanel('history')} aria-label="占卜录">
              {UiIcon.book}
              <span className="label">占卜录</span>
            </button>
            <button className="icon-btn" onClick={() => setMuted(!muted)} aria-label={muted ? '开启音效' : '关闭音效'}>
              {muted ? UiIcon.soundOff : UiIcon.soundOn}
            </button>
          </nav>
        </div>
      </header>
      <main key={route.page + route.id}>
        {Game ? (
          <Suspense fallback={<Loading />}>
            <Game />
          </Suspense>
        ) : (
          <Home />
        )}
      </main>
      <footer className="footer">
        <div>云卜轩 · 所有签诗判词均为原创 · 结果仅供娱乐</div>
        <div>记录与印章仅保存在本机浏览器</div>
      </footer>
      <SealStamp />
      {panel === 'seals' && <SealBook onClose={() => setPanel(null)} />}
      {panel === 'history' && <HistoryDrawer onClose={() => setPanel(null)} />}
    </>
  );
}
