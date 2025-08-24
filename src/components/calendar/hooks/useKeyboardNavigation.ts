import { useEffect, RefObject } from 'react';
import { isToday } from '@/utils/dateHelpers';

interface KeyboardNavigationOptions {
  setDate: (date: Date) => void;
  setIsDefaultView: (value: boolean) => void;
  generateContinuousDays: (centerDate: Date, startMonths: number, endMonths: number) => {
    days: Date[];
    centerIndex: number;
  };
  setMonthsRange: (range: { start: number; end: number }) => void;
  setAllDays: (days: Date[]) => void;
  setCenterIndex: (index: number) => void;
  setScrollPosition: (position: number) => void;
  scrollContainerRef: RefObject<HTMLDivElement>;
}

export function useKeyboardNavigation({
  setDate,
  setIsDefaultView,
  generateContinuousDays,
  setMonthsRange,
  setAllDays,
  setCenterIndex,
  setScrollPosition,
  scrollContainerRef
}: KeyboardNavigationOptions) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const today = new Date();
        setDate(today);
        setIsDefaultView(true);
        
        // 重置为初始范围
        const initialRange = { start: -6, end: 6 };
        const { days, centerIndex } = generateContinuousDays(today, initialRange.start, initialRange.end);
        
        setMonthsRange(initialRange);
        setAllDays(days);
        setCenterIndex(centerIndex);
        
        if (scrollContainerRef.current) {
          const rowHeight = Math.floor(scrollContainerRef.current.clientHeight / 6);
          const todayIndex = days.findIndex(d => isToday(d));
          if (todayIndex !== -1) {
            const todayRow = Math.floor(todayIndex / 7);
            const targetScroll = Math.round(Math.max(0, (todayRow - 2) * rowHeight));
            setScrollPosition(targetScroll);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    setDate, 
    setIsDefaultView, 
    generateContinuousDays, 
    setMonthsRange, 
    setAllDays, 
    setCenterIndex, 
    setScrollPosition,
    scrollContainerRef
  ]);
}