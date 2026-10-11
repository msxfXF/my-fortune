/** 统一吉凶取色：吉 = 暖金，凶 = 靛蓝，平 = 月白 */
export type Tone = 'ji' | 'ping' | 'xiong';

export const TONE_LABEL: Record<Tone, string> = { ji: '吉', ping: '平', xiong: '凶' };

/** 常见吉凶等级到色调的映射 */
export function toneOfLevel(level: string): Tone {
  if (/凶|下下|空亡|留连|赤口|下签/.test(level)) return 'xiong';
  if (/中平|平|中和/.test(level)) return 'ping';
  return 'ji';
}
