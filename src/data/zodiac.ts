export interface ZodiacInfo {
  animal: string;
  branch: string;
  nature: string;
  colors: string;
  numbers: string;
}

export const ZODIAC_INFO: ZodiacInfo[] = [
  { animal: '鼠', branch: '子', nature: '机敏灵活、善于观察，懂得把握机会；人缘不错，有时略显谨慎多虑。', colors: '蓝、金', numbers: '2、3' },
  { animal: '牛', branch: '丑', nature: '踏实稳重、吃苦耐劳，做事有始有终；为人可靠，偶尔略显固执。', colors: '黄、白', numbers: '1、4' },
  { animal: '虎', branch: '寅', nature: '勇敢自信、富有领导力，敢闯敢拼；热情直率，需留意急躁冲动。', colors: '蓝、橙', numbers: '1、3、4' },
  { animal: '兔', branch: '卯', nature: '温和善良、心思细腻，审美出众；重视和谐，面对冲突容易退让。', colors: '粉、紫', numbers: '3、4、6' },
  { animal: '龙', branch: '辰', nature: '气度恢宏、志向远大，天生具有感召力；自尊心强，宜学会倾听。', colors: '金、银', numbers: '1、6、7' },
  { animal: '蛇', branch: '巳', nature: '冷静睿智、洞察力强，善于谋定后动；外表淡然，内心深藏热情。', colors: '黑、红', numbers: '2、8、9' },
  { animal: '马', branch: '午', nature: '热情奔放、向往自由，行动力十足；人缘广阔，但耐性稍欠。', colors: '黄、绿', numbers: '2、3、7' },
  { animal: '羊', branch: '未', nature: '温柔体贴、富有艺术气质，重感情；心软易被人情所累，宜坚定立场。', colors: '绿、紫', numbers: '2、7' },
  { animal: '猴', branch: '申', nature: '聪明伶俐、反应敏捷，点子多、适应力强；宜专注一处，避免三心二意。', colors: '白、蓝', numbers: '4、9' },
  { animal: '鸡', branch: '酉', nature: '勤奋认真、讲求条理，注重仪表；直言不讳，偶尔显得挑剔。', colors: '金、棕', numbers: '5、7、8' },
  { animal: '狗', branch: '戌', nature: '忠诚正直、富有责任感，重情重义；防备心较重，宜多信任他人。', colors: '绿、红', numbers: '3、4、9' },
  { animal: '猪', branch: '亥', nature: '真诚宽厚、乐天知命，福气深厚；待人慷慨，需留意理财与节制。', colors: '黄、灰', numbers: '2、5、8' },
];

export type TaiSuiRelation = '值太岁' | '冲太岁' | '刑太岁' | '害太岁' | '破太岁' | '六合' | '三合';

export const RELATION_TEXT: Record<TaiSuiRelation, string> = {
  值太岁: '本命年值太岁，运势起伏较大，宜稳中求进、低调行事；民俗上常佩红色饰物以图吉利。',
  冲太岁: '与太岁相冲，主变动：搬迁、换工作、出行频繁；宜主动规划变化，切忌冲动决策。',
  刑太岁: '与太岁相刑，易有口舌是非或人际摩擦；宜宽以待人，留意合同文书细节。',
  害太岁: '与太岁相害，提防小人暗中作梗；人际中宜多留心眼，少交浅言深。',
  破太岁: '与太岁相破，计划易有波折、财务有小耗；做事宜留余地，多备方案。',
  六合: '与太岁六合，得贵人相助，人缘与合作运佳，适合结识新朋友、推进合作。',
  三合: '与太岁三合，天时相助，运势上扬，诸事易得助力，宜积极进取。',
};

export const RELATION_SCORE: Record<TaiSuiRelation, number> = {
  值太岁: -14, 冲太岁: -24, 刑太岁: -12, 害太岁: -8, 破太岁: -6, 六合: 15, 三合: 18,
};

const SIX_HE = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const SAN_HE = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
const HAI = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
const PO = [[0, 9], [6, 3], [2, 11], [5, 8], [4, 1], [10, 7]];
const XING_GROUPS = [[0, 3], [2, 5, 8], [1, 10, 7]];
const SELF_XING = [4, 6, 9, 11];

const pairIn = (pairs: number[][], a: number, b: number) =>
  pairs.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));

/** 地支 a（属相）相对 b（太岁）的全部关系 */
export function taiSuiRelations(a: number, b: number): TaiSuiRelation[] {
  const out: TaiSuiRelation[] = [];
  if (a === b) out.push('值太岁');
  if ((a + 6) % 12 === b) out.push('冲太岁');
  const xing = (a !== b && XING_GROUPS.some((g) => g.includes(a) && g.includes(b))) || (a === b && SELF_XING.includes(a));
  if (xing) out.push('刑太岁');
  if (pairIn(HAI, a, b)) out.push('害太岁');
  if (pairIn(PO, a, b)) out.push('破太岁');
  if (pairIn(SIX_HE, a, b)) out.push('六合');
  if (a !== b && SAN_HE.some((g) => g.includes(a) && g.includes(b))) out.push('三合');
  return out;
}

/** 与 a 构成六合、三合、相冲的地支 */
export function harmonyPartners(a: number) {
  const he = SIX_HE.find((p) => p.includes(a))!;
  const san = SAN_HE.find((g) => g.includes(a))!;
  return { liuhe: he[0] === a ? he[1] : he[0], sanhe: san.filter((x) => x !== a), chong: (a + 6) % 12 };
}

export const ASPECT_TEXT: Record<string, [string, string, string]> = {
  事业: ['事业运旺，易获提拔与认可，宜主动承担重任。', '工作稳定，按部就班即可，适合充实技能。', '职场多变动或压力，宜沉稳应对，避免与上司正面冲突。'],
  财运: ['财源广进，正偏财皆有斩获，可适度投资。', '收支平衡，宜储蓄理财，不宜冒进。', '谨防破财，避免借贷担保与高风险投资。'],
  感情: ['桃花旺盛，单身者有望脱单，有伴者感情升温。', '感情平稳，多陪伴、多沟通即可。', '易有误会争执，宜多体谅对方，少计较。'],
  健康: ['精力充沛，适合培养运动习惯。', '整体无碍，注意作息与饮食规律。', '注意意外与旧疾，宜定期体检、避免过劳。'],
};
