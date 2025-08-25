/**
 * 月视图计算工具函数
 */

/**
 * 生成连续的日期数组
 */
export function generateMonthDays(
  centerDate: Date,
  startMonthOffset: number,
  endMonthOffset: number
): { days: Date[]; centerIndex: number } {
  const days: Date[] = [];
  
  // 计算开始日期
  const startDate = new Date(centerDate);
  startDate.setMonth(startDate.getMonth() + startMonthOffset);
  startDate.setDate(1);
  // 调整到周日开始
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // 计算结束日期
  const endDate = new Date(centerDate);
  endDate.setMonth(endDate.getMonth() + endMonthOffset);
  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // 最后一天
  // 调整到周六结束
  const daysToAdd = 6 - endDate.getDay();
  if (daysToAdd > 0) {
    endDate.setDate(endDate.getDate() + daysToAdd);
  }
  
  // 生成日期数组
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  // 找到中心日期的索引
  const targetDate = new Date(centerDate);
  targetDate.setDate(1);
  const centerIndex = days.findIndex(d => 
    d.getFullYear() === targetDate.getFullYear() && 
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === 1
  );
  
  return { days, centerIndex: Math.max(0, centerIndex) };
}

/**
 * 计算指定日期的滚动位置
 */
export function calculateScrollPositionForDate(
  targetDate: Date,
  days: Date[],
  rowHeight: number
): number {
  const targetIndex = days.findIndex(d => 
    d.getFullYear() === targetDate.getFullYear() && 
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === targetDate.getDate()
  );
  
  if (targetIndex === -1) {
    // 如果找不到具体日期，找月份的第一天
    const firstDayOfMonth = days.findIndex(d => 
      d.getFullYear() === targetDate.getFullYear() && 
      d.getMonth() === targetDate.getMonth() &&
      d.getDate() === 1
    );
    
    if (firstDayOfMonth !== -1) {
      const firstDayRow = Math.floor(firstDayOfMonth / 7);
      return Math.max(0, (firstDayRow - 2) * rowHeight);
    }
    
    return 0;
  }
  
  const targetRow = Math.floor(targetIndex / 7);
  return Math.round(Math.max(0, (targetRow - 2) * rowHeight));
}

/**
 * 根据滚动位置获取当前月份
 */
export function getMonthFromScrollPosition(
  scrollPosition: number,
  rowHeight: number,
  days: Date[]
): Date | null {
  const currentRow = Math.floor((scrollPosition + rowHeight * 2.5) / rowHeight);
  const currentDayIndex = currentRow * 7 + 3; // 取每行中间的日期
  
  if (days[currentDayIndex]) {
    return days[currentDayIndex];
  }
  
  return null;
}

/**
 * 计算可见日期范围
 */
export function calculateVisibleDayRange(
  scrollPosition: number,
  containerHeight: number,
  rowHeight: number,
  totalDays: number,
  bufferRows: number = 4
): { startIndex: number; endIndex: number } {
  const visibleStartRow = Math.floor(scrollPosition / rowHeight) - bufferRows;
  const visibleEndRow = Math.ceil((scrollPosition + containerHeight) / rowHeight) + bufferRows;
  
  const startIndex = Math.max(0, visibleStartRow * 7);
  const endIndex = Math.min(totalDays, visibleEndRow * 7);
  
  return { startIndex, endIndex };
}

/**
 * 计算月份在日期数组中的位置
 */
export function findMonthPosition(
  year: number,
  month: number,
  days: Date[]
): number {
  return days.findIndex(d => 
    d.getFullYear() === year && 
    d.getMonth() === month &&
    d.getDate() === 1
  );
}

/**
 * 计算可见内容的参数
 */
export interface VisibleContentParams {
  scrollPosition: number;
  containerHeight: number;
  rowHeight: number;
  isScrolling: boolean;
  daysPerWeek?: number;
  bufferRowsIdle?: number;
  bufferRowsScrolling?: number;
}

/**
 * 计算可见内容的范围和行高
 */
export function calculateVisibleContent(params: VisibleContentParams) {
  const {
    scrollPosition,
    containerHeight,
    rowHeight,
    isScrolling,
    daysPerWeek = 7,
    bufferRowsIdle = 4,
    bufferRowsScrolling = 6
  } = params;

  const bufferRows = isScrolling ? bufferRowsScrolling : bufferRowsIdle;
  const visibleStartRow = Math.floor(scrollPosition / rowHeight) - bufferRows;
  const visibleEndRow = Math.ceil((scrollPosition + containerHeight) / rowHeight) + bufferRows;
  const startIndex = Math.max(0, visibleStartRow * daysPerWeek);
  const endIndex = visibleEndRow * daysPerWeek;

  return {
    visibleStartRow,
    visibleEndRow,
    startIndex,
    endIndex,
    effectiveRowHeight: rowHeight
  };
}