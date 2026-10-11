import type { Element } from '../lib/calendar';

export const DAY_MASTER: Record<string, { image: string; text: string }> = {
  甲: { image: '参天之木', text: '如参天大树，正直向上、有担当，具开创精神与仁慈之心；宜防过刚易折。' },
  乙: { image: '花草藤萝', text: '如花草藤萝，柔韧灵活、善于适应，审美细腻、人缘佳；宜培养决断力。' },
  丙: { image: '太阳之火', text: '如当空烈日，热情开朗、光明磊落，乐于付出、感染力强；宜防急躁冲动。' },
  丁: { image: '灯烛之火', text: '如夜中灯烛，细腻温暖、内敛聪慧，洞察力强、重精神追求；宜防多思多虑。' },
  戊: { image: '高山厚土', text: '如巍峨高山，稳重厚道、守信可靠，有包容之量；宜防固执保守。' },
  己: { image: '田园之土', text: '如沃野田园，温和谦逊、包容细致，善于滋养他人；宜防优柔寡断。' },
  庚: { image: '刀剑之金', text: '如百炼刀剑，刚毅果断、讲义气，执行力强；宜防锋芒太露。' },
  辛: { image: '珠玉之金', text: '如温润珠玉，精致敏锐、自尊心强，重品味与原则；宜防过于挑剔。' },
  壬: { image: '江河之水', text: '如奔流江河，聪明豁达、志向远大，善于变通；宜防随性散漫。' },
  癸: { image: '雨露之水', text: '如润物雨露，温柔沉静、心思缜密，想象力丰富；宜防敏感多疑。' },
};

export const PATTERN_TEXT: Record<string, string> = {
  正官格: '为人正直守规，重名誉与责任，适合体制、管理、公职类工作。',
  七杀格: '魄力十足、敢于挑战，压力即动力，适合开拓与竞争性强的领域。',
  正财格: '务实勤俭、理财有道，重视稳定收入，适合财务、经营类工作。',
  偏财格: '豪爽大方、善抓机遇，人脉广阔，适合商业、投资与交际类工作。',
  正印格: '仁慈好学、重修养，易得长辈提携，适合教育、学术、文化领域。',
  偏印格: '思维独特、悟性高，擅长专门技艺，适合研究、技术与艺术。',
  食神格: '温和乐观、懂得享受生活，才艺出众，适合餐饮、创作、表演与服务。',
  伤官格: '才华横溢、个性鲜明，表达力强，适合创意、演说与技术创新。',
  建禄格: '自立自强、白手起家，凭自身努力开创事业，宜独当一面。',
  月刃格: '意志刚强、竞争心重，敢拼敢闯，宜将锐气用于正途。',
};

export const ELEMENT_GUIDE: Record<Element, { color: string; direction: string; fields: string }> = {
  木: { color: '青、绿', direction: '东方', fields: '教育、文化、医药、设计、园艺' },
  火: { color: '红、紫', direction: '南方', fields: '互联网、传媒、能源、餐饮、演艺' },
  土: { color: '黄、棕', direction: '中部 / 本地', fields: '地产、建筑、农业、管理、咨询' },
  金: { color: '白、金', direction: '西方', fields: '金融、法律、机械、硬件科技' },
  水: { color: '黑、蓝', direction: '北方', fields: '贸易、物流、旅游、传播、航运' },
};

export const ELEMENT_COLOR: Record<Element, string> = {
  木: '#3fcf8e',
  火: '#ff5b3a',
  土: '#e0a84a',
  金: '#f4efe3',
  水: '#4f7cff',
};

export const ELEMENT_NAME: Record<Element, string> = { 木: '青木', 火: '赤火', 土: '黄土', 金: '白金', 水: '玄水' };
