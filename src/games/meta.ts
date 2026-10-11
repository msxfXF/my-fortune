export interface GameMeta {
  id: string;
  name: string;
  seal: string;
  tagline: string;
  desc: string;
  group: 'core' | 'extra';
}

export const GAMES: GameMeta[] = [
  { id: 'xiaoliuren', name: '小六壬', seal: '六壬', tagline: '掐指起课 · 六宫定吉凶', desc: '以月、日、时辰三轮报数，落于大安、留连、速喜、赤口、小吉、空亡六宫之一。', group: 'core' },
  { id: 'tarot', name: '塔罗牌', seal: '塔罗', tagline: '大阿卡纳 · 国风判词', desc: '二十二张大阿卡纳，正逆各有原创判词；可单抽一张，亦可布「过去·现在·未来」三张牌阵。', group: 'core' },
  { id: 'guanyin', name: '观音灵签', seal: '观音', tagline: '蓄力摇筒 · 一签解惑', desc: '按住签筒蓄力摇晃，松手落签；六十支原创签诗，附白话解签与所问之事提示。', group: 'core' },
  { id: 'liuyao', name: '六爻', seal: '六爻', tagline: '三钱六掷 · 文王成卦', desc: '三枚铜钱连掷六次，自下而上成卦；装纳甲、安六亲、定世应、排六神，本卦变卦一并断之。', group: 'core' },
  { id: 'bazi', name: '八字星盘', seal: '八字', tagline: '生辰四柱 · 五行流转', desc: '输入生辰排出四柱八字，星盘旋转点亮干支，五行粒子倾泻，论日主旺衰、格局与喜用。', group: 'core' },
  { id: 'guandi', name: '关帝灵签', seal: '关帝', tagline: '忠义神签 · 典故立意', desc: '同一签筒、另一套签谱：六十签以历史典故立意，原创七言签诗。', group: 'extra' },
  { id: 'meihua', name: '梅花易数', seal: '梅花', tagline: '数起卦成 · 体用立断', desc: '时间、报数或掷算筹起卦，求本卦、互卦、变卦，以体用五行生克速断吉凶。', group: 'extra' },
  { id: 'shengxiao', name: '生肖推命', seal: '生肖', tagline: '十二兽首 · 流年太岁', desc: '点选你的生肖铜像，推演与流年太岁的合冲刑害，给出年度运势。', group: 'extra' },
  { id: 'chenggu', name: '称骨算命', seal: '称骨', tagline: '铜秤称命 · 两钱知福', desc: '袁天罡称骨法：年、月、日、时各有骨重，铜秤称出总重，查原创批语。', group: 'extra' },
  { id: 'numerology', name: '生命灵数', seal: '灵数', tagline: '数字星轨 · 天赋密码', desc: '西方数秘术：生日数字层层相加得出生命灵数，并排九宫连线、算天赋与命运数。', group: 'extra' },
  { id: 'daily', name: '幸运日签', seal: '日签', tagline: '每日一签 · 黄历宜忌', desc: '每天翻开一页日历签：运势指数、宜忌、吉方、幸运色与数字，连续签到攒福气。', group: 'extra' },
];

export const GAME_BY_ID: Record<string, GameMeta> = Object.fromEntries(GAMES.map((g) => [g.id, g]));
