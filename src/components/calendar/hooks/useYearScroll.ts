import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { 
  generateYears, 
  calculateScrollPositionForYear,
  getYearFromScrollPosition,
  calculateVisibleYearRange 
} from '../utils/yearCalculation';
import { SCROLL_CONFIG, BUFFER_YEARS, YEAR_RANGE } from '../constants/yearview';

interface UseYearScrollProps {
  currentYear: number;
  onYearChange?: (year: number) => void;
  isDefaultView?: boolean;
}

interface UseYearScrollReturn {
  scrollContainerRef: RefObject<HTMLDivElement>;
  scrollPosition: number;
  setScrollPosition: (position: number | ((prev: number) => number)) => void;
  isScrolling: boolean;
  allYears: number[];
  visibleYears: number[];
  yearHeight: number;
  scrollToYear: (year: number) => void;
  handleWheel: (e: WheelEvent) => void;
}

export function useYearScroll({
  currentYear,
  onYearChange,
  isDefaultView = false
}: UseYearScrollProps): UseYearScrollReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [allYears, setAllYears] = useState<number[]>([]);
  const [visibleYears, setVisibleYears] = useState<number[]>([]);
  const [yearsRange, setYearsRange] = useState({ 
    start: YEAR_RANGE.START_OFFSET, 
    end: YEAR_RANGE.END_OFFSET 
  });
  
  const scrollVelocityRef = useRef(0);
  const yearHeightRef = useRef(0);
  const rafIdRef = useRef<number>();
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 初始化年份列表
  useEffect(() => {
    const centerYear = new Date().getFullYear();
    const years = generateYears(centerYear, yearsRange.start, yearsRange.end);
    setAllYears(years);
    
    // 设置初始滚动位置
    if (scrollContainerRef.current) {
      yearHeightRef.current = scrollContainerRef.current.clientHeight;
      const initialScroll = calculateScrollPositionForYear(
        currentYear, 
        years, 
        yearHeightRef.current
      );
      setScrollPosition(initialScroll);
    }
  }, []);

  // 滚动到指定年份
  const scrollToYear = useCallback((year: number) => {
    if (scrollContainerRef.current) {
      const targetScroll = calculateScrollPositionForYear(
        year,
        allYears,
        yearHeightRef.current
      );
      setScrollPosition(targetScroll);
    }
  }, [allYears]);

  // 处理滚轮事件
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const scrollSpeed = SCROLL_CONFIG.SPEED;
    const delta = e.deltaY * scrollSpeed;
    
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

  // 根据滚动位置更新当前年份
  useEffect(() => {
    if (allYears.length === 0 || isDefaultView) return;
    
    const currentYear = getYearFromScrollPosition(
      scrollPosition,
      yearHeightRef.current,
      allYears
    );
    
    if (currentYear && onYearChange) {
      onYearChange(currentYear);
    }
  }, [scrollPosition, allYears, isDefaultView, onYearChange]);

  // 计算可见年份
  useEffect(() => {
    if (!scrollContainerRef.current || allYears.length === 0) return;
    
    const containerHeight = scrollContainerRef.current.clientHeight;
    const yearHeight = yearHeightRef.current || containerHeight;
    const bufferSize = isScrolling ? BUFFER_YEARS.SCROLLING : BUFFER_YEARS.IDLE;
    
    const range = calculateVisibleYearRange(
      scrollPosition,
      containerHeight,
      yearHeight,
      allYears.length,
      bufferSize
    );
    
    const visible = allYears.slice(range.start, range.end);
    setVisibleYears(visible);
  }, [scrollPosition, allYears, isScrolling]);

  // 无限滚动加载
  useEffect(() => {
    if (allYears.length === 0) return;
    
    const yearHeight = yearHeightRef.current || 400;
    const currentIndex = Math.round(scrollPosition / yearHeight);
    const velocity = scrollVelocityRef.current;
    
    const baseThreshold = SCROLL_CONFIG.BASE_THRESHOLD;
    const dynamicThreshold = baseThreshold + Math.floor(velocity / 10);
    
    let needsUpdate = false;
    let newStart = yearsRange.start;
    let newEnd = yearsRange.end;
    
    const yearsToLoad = velocity > SCROLL_CONFIG.VELOCITY_THRESHOLD 
      ? SCROLL_CONFIG.YEARS_TO_LOAD_FAST 
      : SCROLL_CONFIG.YEARS_TO_LOAD_NORMAL;
    
    if (currentIndex < dynamicThreshold) {
      newStart = yearsRange.start - yearsToLoad;
      needsUpdate = true;
    }
    
    if (currentIndex > allYears.length - dynamicThreshold) {
      newEnd = yearsRange.end + yearsToLoad;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      const viewingYear = allYears[currentIndex] || currentYear;
      const centerYear = new Date().getFullYear();
      const years = generateYears(centerYear, newStart, newEnd);
      
      const newScrollPosition = calculateScrollPositionForYear(
        viewingYear,
        years,
        yearHeight
      );
      
      setYearsRange({ start: newStart, end: newEnd });
      setAllYears(years);
      setScrollPosition(newScrollPosition);
    }
  }, [scrollPosition, allYears, currentYear, yearsRange]);

  return {
    scrollContainerRef,
    scrollPosition,
    setScrollPosition,
    isScrolling,
    allYears,
    visibleYears,
    yearHeight: yearHeightRef.current,
    scrollToYear,
    handleWheel
  };
}