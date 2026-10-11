import GameShell from '../components/GameShell';
import QianTong from '../components/QianTong';
import { GUANYIN } from '../data/guanyin';

export default function Guanyin() {
  return (
    <GameShell id="guanyin">
      <QianTong game="guanyin" libName="观音灵签" lots={GUANYIN} theme="guanyin" tubeLabel="观音灵签" />
    </GameShell>
  );
}
