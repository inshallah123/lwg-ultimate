export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;

export const WEEKDAY_NAMES_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
] as const;

export const TIME_SLOTS = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
  '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
];

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export const formatDate = (date: Date | null, format: 'long' | 'short' = 'long'): string => {
  if (!date) return '';
  
  if (format === 'long') {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  } else {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }
};

export const formatTimeRange = (hourIndex: number): string => {
  if (hourIndex < 0 || hourIndex >= TIME_SLOTS.length) {
    return TIME_SLOTS[0];
  }
  return TIME_SLOTS[hourIndex];
};



export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const getWeekDays = (startDate: Date): Date[] => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
};

export const formatWeekRange = (weekDays: Date[]): string => {
  if (weekDays.length < 7) return '';
  
  const start = weekDays[0];
  const end = weekDays[6];
  
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}-${end.getDate()}, ${MONTH_NAMES_SHORT[start.getMonth()]}, ${start.getFullYear()}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${end.getDate()}, ${MONTH_NAMES_SHORT[start.getMonth()]}-${MONTH_NAMES_SHORT[end.getMonth()]}, ${start.getFullYear()}`;
  } else {
    return `${start.getDate()}-${end.getDate()}, ${MONTH_NAMES_SHORT[start.getMonth()]}-${MONTH_NAMES_SHORT[end.getMonth()]}, ${start.getFullYear()}-${end.getFullYear()}`;
  }
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const totalDays = 42; // 6 weeks * 7 days
  
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  
  return days;
};

export const getNextRecurrenceDate = (
  date: Date, 
  recurrence: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
  customDays?: number
): Date => {
  const next = new Date(date);
  
  switch (recurrence) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'custom':
      if (customDays) {
        next.setDate(next.getDate() + customDays);
      }
      break;
  }
  
  return next;
};

export const generateRecurrenceInstances = (
  baseDate: Date,
  recurrence: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
  startRange: Date,
  endRange: Date,
  customDays?: number,
  excludedDates?: Date[],
  recurrenceEndDate?: Date
): Date[] => {
  const instances: Date[] = [];
  let currentDate = new Date(baseDate);
  
  // 如果有设置重复结束日期，使用较小的那个
  const effectiveEndDate = recurrenceEndDate && recurrenceEndDate < endRange 
    ? recurrenceEndDate 
    : endRange;
  
  while (currentDate <= effectiveEndDate) {
    if (currentDate >= startRange) {
      const isExcluded = excludedDates?.some(excluded => 
        isSameDay(excluded, currentDate)
      );
      
      if (!isExcluded) {
        instances.push(new Date(currentDate));
      }
    }
    
    currentDate = getNextRecurrenceDate(currentDate, recurrence, customDays);
    
    // 防止无限循环
    if (instances.length > 365) break;
  }
  
  return instances;
};