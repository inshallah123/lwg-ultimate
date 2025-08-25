import { useMemo } from 'react';
import { generateMonthDays } from '../utils/monthCalculation';

interface UseMonthDateGenerationProps {
  centerDate: Date;
  monthsRange: { start: number; end: number };
}

interface UseMonthDateGenerationReturn {
  allDays: Date[];
  centerIndex: number;
  monthBoundaries: Map<string, { start: number; end: number }>;
}

export function useMonthDateGeneration({
  centerDate,
  monthsRange
}: UseMonthDateGenerationProps): UseMonthDateGenerationReturn {
  
  const { allDays, centerIndex, monthBoundaries } = useMemo(() => {
    const { days, centerIndex: idx } = generateMonthDays(
      centerDate,
      monthsRange.start,
      monthsRange.end
    );
    
    // 计算每个月份的边界索引，用于优化渲染
    const boundaries = new Map<string, { start: number; end: number }>();
    let currentMonth = -1;
    let currentYear = -1;
    let monthStart = 0;
    
    days.forEach((day, index) => {
      const month = day.getMonth();
      const year = day.getFullYear();
      
      if (month !== currentMonth || year !== currentYear) {
        // 保存上一个月的边界
        if (currentMonth !== -1) {
          const key = `${currentYear}-${currentMonth}`;
          boundaries.set(key, { start: monthStart, end: index - 1 });
        }
        
        // 开始新的月份
        currentMonth = month;
        currentYear = year;
        monthStart = index;
      }
    });
    
    // 保存最后一个月的边界
    if (currentMonth !== -1) {
      const key = `${currentYear}-${currentMonth}`;
      boundaries.set(key, { start: monthStart, end: days.length - 1 });
    }
    
    return { 
      allDays: days, 
      centerIndex: idx,
      monthBoundaries: boundaries
    };
  }, [centerDate, monthsRange.start, monthsRange.end]);
  
  return { allDays, centerIndex, monthBoundaries };
}