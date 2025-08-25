export function generateYears(centerYear: number, startOffset: number, endOffset: number): number[] {
  const years: number[] = [];
  for (let i = centerYear + startOffset; i <= centerYear + endOffset; i++) {
    years.push(i);
  }
  return years;
}

export function calculateYearIndex(year: number, years: number[]): number {
  return years.indexOf(year);
}

export function calculateScrollPositionForYear(
  year: number, 
  years: number[], 
  yearHeight: number
): number {
  const index = calculateYearIndex(year, years);
  return index !== -1 ? index * yearHeight : 0;
}

export function getYearFromScrollPosition(
  scrollPosition: number,
  yearHeight: number,
  years: number[]
): number | undefined {
  const index = Math.round(scrollPosition / yearHeight);
  return years[index];
}

export function calculateVisibleYearRange(
  scrollPosition: number,
  containerHeight: number,
  yearHeight: number,
  totalYears: number,
  bufferSize: number = 2
): { start: number; end: number } {
  const visibleStartIndex = Math.floor(scrollPosition / yearHeight) - bufferSize;
  const visibleEndIndex = Math.ceil((scrollPosition + containerHeight) / yearHeight) + bufferSize;
  
  return {
    start: Math.max(0, visibleStartIndex),
    end: Math.min(totalYears, visibleEndIndex)
  };
}

export function isCurrentMonth(year: number, monthIndex: number): boolean {
  const today = new Date();
  return year === today.getFullYear() && monthIndex === today.getMonth();
}

export function isTodayMonth(year: number, monthIndex: number): boolean {
  return isCurrentMonth(year, monthIndex);
}

export function calculateYearSectionPosition(
  yearIndex: number,
  yearHeight: number,
  scrollPosition: number
): number {
  return yearIndex * yearHeight - scrollPosition;
}

export interface DateComparison {
  isCurrentYear: boolean;
  isTodayYear: boolean;
  todayMonth: number;
}

export function getDateComparison(year: number, currentDate: Date): DateComparison {
  const today = new Date();
  return {
    isCurrentYear: year === currentDate.getFullYear(),
    isTodayYear: year === today.getFullYear(),
    todayMonth: today.getMonth()
  };
}