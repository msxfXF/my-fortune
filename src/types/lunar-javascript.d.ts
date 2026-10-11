declare module 'lunar-javascript' {
  export interface SolarObj {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getLunar(): LunarObj;
    toYmd(): string;
  }

  export interface YunObj {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getDaYun(count?: number): DaYunObj[];
  }

  export interface DaYunObj {
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getGanZhi(): string;
    getIndex(): number;
  }

  export interface EightCharObj {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYun(gender: number): YunObj;
    setSect(sect: number): void;
  }

  export interface LunarObj {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getYearInGanZhiByLiChun(): string;
    getYearZhi(): string;
    getYearZhiByLiChun(): string;
    getYearShengXiao(): string;
    getYearShengXiaoByLiChun(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getMonthInGanZhi(): string;
    getMonthZhi(): string;
    getDayInGanZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayXunKong(): string;
    getTimeZhi(): string;
    getTimeInGanZhi(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayPositionCaiDesc(): string;
    getDayPositionXiDesc(): string;
    getDayPositionFuDesc(): string;
    getJieQi(): string;
    getEightChar(): EightCharObj;
    getSolar(): SolarObj;
    toString(): string;
  }

  export const Solar: {
    fromYmd(y: number, m: number, d: number): SolarObj;
    fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): SolarObj;
    fromDate(date: Date): SolarObj;
  };

  export const Lunar: {
    fromYmd(y: number, m: number, d: number): LunarObj;
    fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): LunarObj;
    fromDate(date: Date): LunarObj;
  };

  export const LunarMonth: {
    fromYm(y: number, m: number): { getDayCount(): number } | null;
  };

  export const LunarYear: {
    fromYear(y: number): { getLeapMonth(): number };
  };
}
