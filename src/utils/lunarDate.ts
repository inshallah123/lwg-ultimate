import { Solar, HolidayUtil } from 'lunar-javascript';

export interface LunarDateInfo {
  lunar: string;         // 阴历日期
  festival?: string;     // 节假日
  solarTerm?: string;    // 节气
  workday?: string;      // 调休（班）
}

export function getLunarDateInfo(date: Date): LunarDateInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  const info: LunarDateInfo = {
    lunar: ''
  };
  
  // 获取阴历日期
  const lunarDay = lunar.getDayInChinese();
  if (lunarDay === '初一') {
    // 如果是初一，显示月份
    info.lunar = lunar.getMonthInChinese() + '月';
  } else {
    info.lunar = lunarDay;
  }
  
  // 获取节假日
  const festivals: string[] = [];
  
  // 阳历节日
  const solarFestival = solar.getFestivals();
  if (solarFestival.length > 0) {
    festivals.push(...solarFestival);
  }
  
  // 阴历节日
  const lunarFestival = lunar.getFestivals();
  if (lunarFestival.length > 0) {
    festivals.push(...lunarFestival);
  }
  
  // 节气 - 使用Lunar对象的getJieQi方法
  const jieQi = lunar.getJieQi();
  if (jieQi) {
    info.solarTerm = jieQi;
  }
  
  // 法定节假日
  const holiday = HolidayUtil.getHoliday(
    solar.getYear(), 
    solar.getMonth(), 
    solar.getDay()
  );
  
  if (holiday) {
    const name = holiday.getName();
    if (name && !festivals.includes(name)) {
      festivals.push(name);
    }
    
    // 检查是否调休
    if (!holiday.isWork()) {
      // 正常假期
    } else {
      // 调休上班
      info.workday = '班';
    }
  }
  
  // 特殊节日处理
  const weekInMonth = Math.ceil(solar.getDay() / 7);
  const weekDay = solar.getWeek();
  
  // 母亲节（5月第二个星期日）
  if (solar.getMonth() === 5 && weekInMonth === 2 && weekDay === 0) {
    festivals.push('母亲节');
  }
  
  // 父亲节（6月第三个星期日）
  if (solar.getMonth() === 6 && weekInMonth === 3 && weekDay === 0) {
    festivals.push('父亲节');
  }
  
  // 感恩节（11月第四个星期四）
  if (solar.getMonth() === 11 && weekInMonth === 4 && weekDay === 4) {
    festivals.push('感恩节');
  }
  
  if (festivals.length > 0) {
    // 只取第一个最重要的节日
    info.festival = festivals[0];
  }
  
  return info;
}