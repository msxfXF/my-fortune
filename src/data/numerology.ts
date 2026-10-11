export interface NumberMeaning {
  title: string;
  keywords: string;
  nature: string;
  strength: string;
  challenge: string;
  color: string;
}

export const NUMBER_MEANING: Record<number, NumberMeaning> = {
  1: { title: '开创者', keywords: '独立 · 领导 · 开创', nature: '天生的领头羊，有主见、行动力强，喜欢开辟属于自己的新路。', strength: '勇于决策、自我驱动，遇事敢为人先。', challenge: '学会合作与倾听，避免固执独断。', color: '赤红' },
  2: { title: '协调者', keywords: '敏感 · 合作 · 和平', nature: '心思细腻、善解人意，擅长在人与人之间搭起桥梁。', strength: '体贴、耐心，是最好的伙伴与支持者。', challenge: '建立自信，别过度在意他人眼光。', color: '橘橙' },
  3: { title: '表达者', keywords: '创意 · 乐观 · 沟通', nature: '才思敏捷、幽默风趣，具有天生的表达与艺术天赋。', strength: '感染力强、点子多，能为团队带来欢乐。', challenge: '专注与坚持，避免三分钟热度。', color: '明黄' },
  4: { title: '建设者', keywords: '务实 · 稳定 · 秩序', nature: '脚踏实地、条理分明，是值得信赖的实干家。', strength: '可靠、耐力强，擅长规划与执行。', challenge: '拥抱变化，别被规则与习惯困住。', color: '翠绿' },
  5: { title: '探险者', keywords: '自由 · 变化 · 冒险', nature: '热爱自由与新鲜事物，适应力极强，人生经历丰富多彩。', strength: '灵活、勇敢，好奇心旺盛。', challenge: '学会节制与承诺，避免浮躁。', color: '天蓝' },
  6: { title: '守护者', keywords: '责任 · 关爱 · 和谐', nature: '富有爱心与责任感，重视家庭，总在照顾身边的人。', strength: '温暖可靠，审美出众，善于营造和谐。', challenge: '照顾别人之余也要善待自己，勿过度操心。', color: '靛青' },
  7: { title: '探索者', keywords: '智慧 · 内省 · 真理', nature: '喜欢思考、追根究底，拥有敏锐的洞察力与直觉。', strength: '分析力强，独立而深刻。', challenge: '走出象牙塔，学会信任与分享。', color: '紫罗兰' },
  8: { title: '掌权者', keywords: '权力 · 财富 · 成就', nature: '目标明确、企图心强，具有经营与管理的天赋。', strength: '执行力强，懂得整合资源、创造价值。', challenge: '平衡物质与精神，宽以待人。', color: '玫瑰金' },
  9: { title: '理想者', keywords: '博爱 · 智慧 · 奉献', nature: '胸怀宽广、富有同理心，关心更大的世界。', strength: '包容、有远见，乐于助人。', challenge: '把理想落到实处，学会放下与告别。', color: '月白' },
  11: { title: '启迪者 · 大师数', keywords: '直觉 · 灵感 · 启发', nature: '拥有极强的直觉与灵性，常能看见他人看不见的东西，照亮身边的人。', strength: '洞察入微，富有感召力与创造灵感。', challenge: '情绪起伏较大，需学会安定内心、脚踏实地。', color: '银白' },
  22: { title: '筑梦者 · 大师数', keywords: '宏图 · 实践 · 远见', nature: '能把宏大的梦想落地为现实的建筑师，兼具理想与务实。', strength: '远见与执行力并存，适合成就大事业。', challenge: '肩上压力巨大，需避免过度苛求自己。', color: '珊瑚' },
  33: { title: '大爱导师 · 大师数', keywords: '慈悲 · 疗愈 · 奉献', nature: '以爱与智慧服务众人，是天生的导师与疗愈者。', strength: '无私温暖，能够启发与疗愈人心。', challenge: '设立界限，避免自我牺牲过度。', color: '流金' },
};

/** 毕达哥拉斯九宫格：
 *   3 6 9
 *   2 5 8
 *   1 4 7
 */
export const GRID_LAYOUT = [[3, 6, 9], [2, 5, 8], [1, 4, 7]];

export const GRID_LINES: { nums: [number, number, number]; name: string; desc: string }[] = [
  { nums: [1, 2, 3], name: '艺术线', desc: '感受力敏锐，富有艺术天分与审美。' },
  { nums: [4, 5, 6], name: '组织线', desc: '擅长统筹规划，做事井井有条。' },
  { nums: [7, 8, 9], name: '权力线', desc: '有魄力与企图心，具领导潜质。' },
  { nums: [1, 4, 7], name: '物质线', desc: '务实重行动，懂得为生活打下基础。' },
  { nums: [2, 5, 8], name: '情感线', desc: '情感丰沛，重视人与人之间的连结。' },
  { nums: [3, 6, 9], name: '智慧线', desc: '思维活跃，学习力与理解力俱佳。' },
  { nums: [1, 5, 9], name: '事业线', desc: '目标清晰，有贯彻始终的决心。' },
  { nums: [3, 5, 7], name: '人缘线', desc: '亲和力强，身边常有贵人相助。' },
];

const PYTHAGOREAN: Record<string, number> = {};
'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c, i) => (PYTHAGOREAN[c] = (i % 9) + 1));

export function reduceNumber(n: number, keepMaster = true): { steps: number[]; result: number } {
  const steps = [n];
  let cur = n;
  while (cur > 9 && !(keepMaster && (cur === 11 || cur === 22 || cur === 33))) {
    cur = String(cur).split('').reduce((s, d) => s + Number(d), 0);
    steps.push(cur);
  }
  return { steps, result: cur };
}

export function lifePath(y: number, m: number, d: number) {
  const digits = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`.split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  const { steps, result } = reduceNumber(sum);
  return { digits, sum, steps, result };
}

export function birthdayNumber(d: number) {
  return reduceNumber(d).result;
}

export function expressionNumber(name: string): { letters: { c: string; v: number }[]; result: number } | null {
  const letters = name
    .toLowerCase()
    .split('')
    .filter((c) => PYTHAGOREAN[c])
    .map((c) => ({ c, v: PYTHAGOREAN[c] }));
  if (!letters.length) return null;
  const sum = letters.reduce((a, b) => a + b.v, 0);
  return { letters, result: reduceNumber(sum).result };
}
