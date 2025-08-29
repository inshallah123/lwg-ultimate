declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getWeek(): number;
    getFestivals(): string[];
  }

  export class Lunar {
    getDayInChinese(): string;
    getMonthInChinese(): string;
    getFestivals(): string[];
    getJieQi(): string;
  }

  export class Holiday {
    getName(): string | null;
    isWork(): boolean;
  }

  export class HolidayUtil {
    static getHoliday(year: number, month: number, day: number): Holiday | null;
  }
}