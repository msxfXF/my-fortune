import GameShell from '../components/GameShell';
import QianTong from '../components/QianTong';
import { GUANDI } from '../data/guandi';

export default function Guandi() {
  return (
    <GameShell id="guandi">
      <QianTong game="guandi" libName="关帝灵签" lots={GUANDI} theme="guandi" tubeLabel="关帝灵签" />
    </GameShell>
  );
}
