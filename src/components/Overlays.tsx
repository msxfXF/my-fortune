import { useEffect, useState } from 'react';
import { GAMES, GAME_BY_ID } from '../games/meta';
import { clearHistory, onNewSeal, useStore } from '../lib/storage';
import { sfx } from '../lib/sound';
import { UiIcon } from './Icons';
import Seal from './Seal';

/** 首次完成某玩法时，印章“盖”在屏幕上 */
export function SealStamp() {
  const [game, setGame] = useState<string | null>(null);
  useEffect(
    () =>
      onNewSeal((g) => {
        setTimeout(() => {
          setGame(g);
          sfx.gong();
        }, 1400);
      }),
    [],
  );
  useEffect(() => {
    if (!game) return;
    const t = setTimeout(() => setGame(null), 2700);
    return () => clearTimeout(t);
  }, [game]);
  if (!game) return null;
  const meta = GAME_BY_ID[game];
  return (
    <div className="stamp-overlay">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Seal text={meta.seal} />
        <div className="stamp-text">点亮「{meta.name}」印章</div>
      </div>
    </div>
  );
}

function Modal({ onClose, children, drawer }: { onClose: () => void; children: React.ReactNode; drawer?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={`modal-backdrop${drawer ? ' drawer-backdrop' : ''}`} onClick={onClose}>
      <div className={`panel modal${drawer ? ' drawer' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="关闭">
          {UiIcon.close}
        </button>
        {children}
      </div>
    </div>
  );
}

export function SealBook({ onClose }: { onClose: () => void }) {
  const seals = useStore((s) => s.seals);
  const lit = GAMES.filter((g) => seals[g.id]).length;
  return (
    <Modal onClose={onClose}>
      <h2 className="gold-text">印章簿</h2>
      <div className="muted" style={{ letterSpacing: 2, fontSize: 14 }}>
        每种玩法首次完成，点亮一枚印章 · 已集 {lit} / {GAMES.length}
      </div>
      <div className="seal-grid">
        {GAMES.map((g) => (
          <a key={g.id} className="seal-item" href={`#/game/${g.id}`} onClick={onClose}>
            <Seal text={g.seal} off={!seals[g.id]} />
            {g.name}
            <small>{seals[g.id] ? new Date(seals[g.id]).toLocaleDateString('zh-CN') + ' 点亮' : '尚未点亮'}</small>
          </a>
        ))}
      </div>
    </Modal>
  );
}

export function HistoryDrawer({ onClose }: { onClose: () => void }) {
  const history = useStore((s) => s.history);
  return (
    <Modal onClose={onClose} drawer>
      <h2 className="gold-text">占卜录</h2>
      <div className="muted" style={{ letterSpacing: 2, fontSize: 13 }}>
        最近 {history.length} 条记录，仅保存在本机浏览器
      </div>
      {history.length === 0 ? (
        <div className="empty">尚无记录，去殿中问一卦吧</div>
      ) : (
        <ul className="history-list">
          {history.map((h) => (
            <li key={h.id} className={`history-item tone-${h.tone}`}>
              <div className="hi-top">
                <span>{GAME_BY_ID[h.game]?.name ?? h.game}</span>
                <span>{new Date(h.time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="hi-title">{h.title}</div>
              <div className="hi-sum">{h.summary}</div>
            </li>
          ))}
        </ul>
      )}
      {history.length > 0 && (
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => confirm('确定清空全部占卜记录？') && clearHistory()}>
          清空记录
        </button>
      )}
    </Modal>
  );
}
