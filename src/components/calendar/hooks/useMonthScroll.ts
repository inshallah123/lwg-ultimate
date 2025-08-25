import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { 
  generateMonthDays,
  calculateScrollPositionForDate,
  getMonthFromScrollPosition,
  calculateVisibleDayRange
} from '../utils/monthCalculation';
import { SCROLL_CONFIG, BUFFER_ROWS, MONTH_RANGE, VIEW_CONFIG } from '../constants/monthview';

interface UseMonthScrollProps {
  currentDate: Date;
  onMonthChange?: (date: Date) => void;
  isDefaultView?: boolean;
}

interface UseMonthScrollReturn {
  scrollContainerRef: RefObject<HTMLDivElement>;
  scrollPosition: number;
  setScrollPosition: (position: number | ((prev: number) => number)) => void;
  isScrolling: boolean;
  allDays: Date[];
  visibleDays: Date[];
  rowHeight: number;
  scrollToDate: (date: Date) => void;
  handleWheel: (e: WheelEvent) => void;
  isInitialized: boolean;
  resetToDate: (date: Date) => void;
}

export function useMonthScroll({
  currentDate,
  onMonthChange,
  isDefaultView = false
}: UseMonthScrollProps): UseMonthScrollReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [allDays, setAllDays] = useState<Date[]>([]);
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [monthsRange, setMonthsRange] = useState({ 
    start: MONTH_RANGE.START_OFFSET, 
    end: MONTH_RANGE.END_OFFSET 
  });
  
  const scrollVelocityRef = useRef(0);
  const rowHeightRef = useRef(0);
  const rafIdRef = useRef<number>();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 初始化日期列表
  useEffect(() => {
    if (!scrollContainerRef.current || isInitialized) return;
    
    const { days} = generateMonthDays(
      currentDate, 
      monthsRange.start, 
      monthsRange.end
    );
    
    const containerHeight = scrollContainerRef.current.clientHeight;
    const rowHeight = Math.floor(containerHeight / VIEW_CONFIG.ROWS_PER_SCREEN);
    rowHeightRef.current = rowHeight;
    
    const initialScroll = calculateScrollPositionForDate(currentDate, days, rowHeight);
    
    setAllDays(days);
    setScrollPosition(initialScroll);
    setIsInitialized(true);
  }, [currentDate, monthsRange.start, monthsRange.end, isInitialized]);

  // 滚动到指定日期
  const scrollToDate = useCallback((date: Date) => {
    if (!scrollContainerRef.current) return;
    
    const targetScroll = calculateScrollPositionForDate(
      date,
      allDays,
      rowHeightRef.current
    );
    setScrollPosition(targetScroll);
  }, [allDays]);

  // 重置到指定日期（重新生成日期范围）
  const resetToDate = useCallback((date: Date) => {
    if (!scrollContainerRef.current) return;
    
    // 重新生成以目标日期为中心的日期范围
    const { days} = generateMonthDays(
      date, 
      MONTH_RANGE.START_OFFSET, 
      MONTH_RANGE.END_OFFSET
    );
    
    const containerHeight = scrollContainerRef.current.clientHeight;
    const rowHeight = Math.floor(containerHeight / VIEW_CONFIG.ROWS_PER_SCREEN);
    rowHeightRef.current = rowHeight;
    
    const initialScroll = calculateScrollPositionForDate(date, days, rowHeight);
    
    // 更新状态
    setMonthsRange({ start: MONTH_RANGE.START_OFFSET, end: MONTH_RANGE.END_OFFSET });
    setAllDays(days);
    setScrollPosition(initialScroll);
    
    // 如果有月份变化回调，触发它
    if (onMonthChange) {
      onMonthChange(date);
    }
  }, [onMonthChange]);

  // 处理滚轮事件
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY * SCROLL_CONFIG.SPEED;
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      setScrollPosition(prev => {
        const newPosition = prev + delta;
        scrollVelocityRef.current = Math.abs(delta);
        return Math.max(0, newPosition);
      });
    });
    
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollVelocityRef.current = 0;
    }, SCROLL_CONFIG.TIMEOUT);
  }, []);

  // 监听滚轮事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [handleWheel]);

  // 根据滚动位置更新当前月份
  useEffect(() => {
    if (allDays.length === 0 || isDefaultView || !isInitialized) return;
    
    const newDate = getMonthFromScrollPosition(
      scrollPosition,
      rowHeightRef.current,
      allDays
    );
    
    if (newDate && onMonthChange) {
      if (newDate.getMonth() !== currentDate.getMonth() || 
          newDate.getFullYear() !== currentDate.getFullYear()) {
        onMonthChange(newDate);
      }
    }
  }, [scrollPosition, allDays, isDefaultView, currentDate, onMonthChange, isInitialized]);

  // 计算可见日期
  useEffect(() => {
    if (!scrollContainerRef.current || allDays.length === 0) return;
    
    const containerHeight = scrollContainerRef.current.clientHeight;
    const rowHeight = rowHeightRef.current || VIEW_CONFIG.DEFAULT_ROW_HEIGHT;
    const bufferRows = isScrolling ? BUFFER_ROWS.SCROLLING : BUFFER_ROWS.IDLE;
    
    const { startIndex, endIndex } = calculateVisibleDayRange(
      scrollPosition,
      containerHeight,
      rowHeight,
      allDays.length,
      bufferRows
    );
    
    const visible = allDays.slice(startIndex, endIndex);
    setVisibleDays(visible);
  }, [scrollPosition, allDays, isScrolling]);

  // 无限滚动加载
  useEffect(() => {
    if (allDays.length === 0 || !isInitialized) return;
    
    const rowHeight = rowHeightRef.current || VIEW_CONFIG.DEFAULT_ROW_HEIGHT;
    const totalRows = Math.floor(allDays.length / VIEW_CONFIG.DAYS_PER_WEEK);
    const currentRow = Math.floor((scrollPosition + rowHeight * 3) / rowHeight);
    
    const velocity = scrollVelocityRef.current;
    const dynamicThreshold = SCROLL_CONFIG.BASE_THRESHOLD + Math.floor(velocity / 5);
    
    let needsUpdate = false;
    let newStart = monthsRange.start;
    let newEnd = monthsRange.end;
    
    const monthsToLoad = velocity > SCROLL_CONFIG.VELOCITY_THRESHOLD 
      ? SCROLL_CONFIG.MONTHS_TO_LOAD_FAST 
      : SCROLL_CONFIG.MONTHS_TO_LOAD_NORMAL;
    
    if (currentRow < dynamicThreshold) {
      newStart = monthsRange.start - monthsToLoad;
      needsUpdate = true;
    }
    
    if (currentRow > totalRows - dynamicThreshold) {
      newEnd = monthsRange.end + monthsToLoad;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      const currentDayIndex = currentRow * VIEW_CONFIG.DAYS_PER_WEEK + 3;
      const viewingDate = allDays[currentDayIndex] || currentDate;
      
      const { days } = generateMonthDays(currentDate, newStart, newEnd);
      
      const newViewingIndex = days.findIndex(d => 
        d.getFullYear() === viewingDate.getFullYear() && 
        d.getMonth() === viewingDate.getMonth() &&
        d.getDate() === viewingDate.getDate()
      );
      
      if (newViewingIndex !== -1) {
        const newRow = Math.floor(newViewingIndex / VIEW_CONFIG.DAYS_PER_WEEK);
        const newScrollPosition = newRow * rowHeight - (currentRow * rowHeight - scrollPosition);
        
        setMonthsRange({ start: newStart, end: newEnd });
        setAllDays(days);
        setScrollPosition(newScrollPosition);
      }
    }
  }, [scrollPosition, allDays, currentDate, monthsRange, isInitialized]);

  return {
    scrollContainerRef,
    scrollPosition,
    setScrollPosition,
    isScrolling,
    allDays,
    visibleDays,
    rowHeight: rowHeightRef.current,
    scrollToDate,
    handleWheel,
    isInitialized,
    resetToDate
  };
}