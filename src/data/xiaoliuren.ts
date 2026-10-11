import type { Tone } from '../lib/tone';

export interface Palace {
  name: string;
  level: string;
  tone: Tone;
  god: string;
  direction: string;
  element: string;
  poem: [string, string];
  plain: string;
  aspects: { label: string; text: string }[];
}

/** 六宫固定循环：大安 → 留连 → 速喜 → 赤口 → 小吉 → 空亡 */
export const PALACES: Palace[] = [
  {
    name: '大安', level: '上吉', tone: 'ji', god: '青龙', direction: '正东', element: '木',
    poem: ['大安身值静如山，', '求谋诸事总平安。'],
    plain: '此课主安稳。事情在掌控之中，不必急于求变；守住当下的节奏，所求多能如愿。',
    aspects: [
      { label: '求财', text: '财在稳处，宜守成，不宜投机。' },
      { label: '出行', text: '平顺无阻，宜向东行。' },
      { label: '感情', text: '感情安定，相处如常即好。' },
      { label: '失物', text: '物未远离，多在家中原处。' },
      { label: '健康', text: '身体平稳，注意作息规律。' },
    ],
  },
  {
    name: '留连', level: '凶', tone: 'xiong', god: '玄武', direction: '正北', element: '水',
    poem: ['留连之事未和同，', '进退迟疑事未通。'],
    plain: '此课主拖延。事情牵扯反复、一时难有结果；与其心急，不如理清头绪，换个时机再议。',
    aspects: [
      { label: '求财', text: '钱款迟滞，回款需多催促。' },
      { label: '出行', text: '易有延误，宜预留时间。' },
      { label: '感情', text: '暧昧难决，彼此心意未明。' },
      { label: '失物', text: '一时难寻，或被他物遮掩。' },
      { label: '健康', text: '小恙缠绵，宜耐心调养。' },
    ],
  },
  {
    name: '速喜', level: '上吉', tone: 'ji', god: '朱雀', direction: '正南', element: '火',
    poem: ['速喜临门笑颜开，', '喜信随风入宅来。'],
    plain: '此课主喜讯速至。所问之事进展快、多有好消息，宜趁热打铁，午时前后尤佳。',
    aspects: [
      { label: '求财', text: '财来得快，宜及时把握。' },
      { label: '出行', text: '一路顺风，往南更吉。' },
      { label: '感情', text: '佳音将至，宜主动表达。' },
      { label: '失物', text: '速寻可得，多在南方。' },
      { label: '健康', text: '病情好转，心情开朗。' },
    ],
  },
  {
    name: '赤口', level: '凶', tone: 'xiong', god: '白虎', direction: '正西', element: '金',
    poem: ['赤口之神当日辰，', '闲事口舌是非生。'],
    plain: '此课主口舌。言语易起冲突，或被卷入是非；少说多听、对事不对人，可免一场争执。',
    aspects: [
      { label: '求财', text: '谨防合同纠纷与口头承诺。' },
      { label: '出行', text: '小心磕碰，避免与人争执。' },
      { label: '感情', text: '易因小事拌嘴，宜多包容。' },
      { label: '失物', text: '恐难追回，或已被人取走。' },
      { label: '健康', text: '注意咽喉与情绪上火。' },
    ],
  },
  {
    name: '小吉', level: '中吉', tone: 'ji', god: '六合', direction: '西南', element: '水',
    poem: ['小吉临身百事宜，', '进退求财总相宜。'],
    plain: '此课主小有顺遂。虽非大喜，但处处有转圜余地，合作与人情尤佳，适合推进中小事务。',
    aspects: [
      { label: '求财', text: '有小进账，合作生财。' },
      { label: '出行', text: '顺遂平安，偶遇故人。' },
      { label: '感情', text: '和合之象，宜约会相聚。' },
      { label: '失物', text: '问身边人可得线索。' },
      { label: '健康', text: '无大碍，宜适度运动。' },
    ],
  },
  {
    name: '空亡', level: '大凶', tone: 'xiong', god: '勾陈', direction: '中央', element: '土',
    poem: ['空亡之神事不祥，', '阴人虚诈不可当。'],
    plain: '此课主落空。所求之事恐虚而不实，谨防被人所诳；宜暂缓决定、核实信息，静待下次起课。',
    aspects: [
      { label: '求财', text: '财务落空，切勿轻信许诺。' },
      { label: '出行', text: '宜改期，或多做准备。' },
      { label: '感情', text: '一方心意虚浮，需多观察。' },
      { label: '失物', text: '难以寻回，不如放下。' },
      { label: '健康', text: '精神不济，宜静养休息。' },
    ],
  },
];

/** 闭式公式：最终宫位 = ((月-1) + (日-1) + (时辰序号-1)) mod 6 */
export function xiaoLiuRen(month: number, day: number, shichen: number) {
  const first = (month - 1) % 6;
  const second = (first + day - 1) % 6;
  const third = (second + shichen - 1) % 6;
  return { first, second, third };
}
