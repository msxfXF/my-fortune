import type { Tone } from '../lib/tone';

export type LotLevel = '上上' | '上吉' | '中吉' | '中平' | '下下';

export interface Lot {
  no: number;
  title: string;
  level: LotLevel;
  poem: string[];
  interp: string;
}

export const LOT_LEVEL_TONE: Record<LotLevel, Tone> = {
  上上: 'ji', 上吉: 'ji', 中吉: 'ji', 中平: 'ping', 下下: 'xiong',
};

/** 行格式：签名|等级|四句签诗（空格分隔）|白话解签 */
export function parseLots(src: string): Lot[] {
  return src
    .trim()
    .split('\n')
    .map((row, i) => {
      const [title, level, poem, interp] = row.split('|').map((s) => s.trim());
      return { no: i + 1, title, level: level as LotLevel, poem: poem.split(/\s+/), interp };
    });
}

export const ASK_TOPICS = ['综合', '求财', '事业', '姻缘', '健康', '出行', '学业'] as const;
export type AskTopic = (typeof ASK_TOPICS)[number];

/** 按“所问之事 × 签等”给出的补充提示 */
export const TOPIC_ADVICE: Record<Exclude<AskTopic, '综合'>, Record<LotLevel, string>> = {
  求财: {
    上上: '财星高照，正财偏财皆有机会，可放手经营。',
    上吉: '财路通畅，稳中求进，收益可观。',
    中吉: '小有进账，宜开源节流、积少成多。',
    中平: '收支持平，守住本金为上，勿贪高利。',
    下下: '谨防破财与受骗，暂缓大额投资。',
  },
  事业: {
    上上: '贵人提携，升迁有望，宜大胆进取。',
    上吉: '工作顺遂，表现易获认可。',
    中吉: '稳步推进，踏实做事终有回报。',
    中平: '原地蓄力，宜精进技能、静待时机。',
    下下: '易逢阻滞与小人，宜低调守成。',
  },
  姻缘: {
    上上: '良缘天成，宜表白、订婚、嫁娶。',
    上吉: '感情甜蜜，彼此心意相通。',
    中吉: '缘分渐近，多参与社交可遇良人。',
    中平: '情路平淡，需用心经营与沟通。',
    下下: '缘分未到或情有波折，切勿强求。',
  },
  健康: {
    上上: '身强体健，旧疾可愈。',
    上吉: '精神饱满，适度锻炼更佳。',
    中吉: '小恙无碍，规律作息即可。',
    中平: '注意劳逸结合，勿过度透支。',
    下下: '宜及早就医检查，切莫讳疾忌医。',
  },
  出行: {
    上上: '出行大吉，远行求谋皆顺。',
    上吉: '一路平安，途中或有惊喜。',
    中吉: '可以成行，注意行程安排。',
    中平: '近行无妨，远行宜再斟酌。',
    下下: '宜改期或另择路线，注意安全。',
  },
  学业: {
    上上: '金榜题名之兆，考试大利。',
    上吉: '思路清晰，学有所成。',
    中吉: '勤能补拙，成绩稳步上升。',
    中平: '基础尚需夯实，切忌临时抱佛脚。',
    下下: '心浮气躁，宜调整方法、静心苦读。',
  },
};
