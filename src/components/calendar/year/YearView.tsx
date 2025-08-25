import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {useCalendarStore} from '../store';
import {useYearScroll} from '../hooks/useYearScroll';
import {useYearKeyboardNavigation} from '@/components/calendar/hooks';
import { YearSection } from './YearSection';
import { 
  calculateYearSectionPosition, 
  getDateComparison,
  calculateYearIndex
} from '../utils/yearCalculation';
import styles from './YearView.module.css';
import sharedStyles from '../shared.module.css';
import {
  NAVIGATION_STEP,
  DEFAULT_VALUES
} from '../constants/yearview';

// 1. 提取可见年份渲染为独立的 memo 化组件
interface VisibleYearsProps {
  isInitialized: boolean;
  visibleYears: number[];
  allYears: number[];
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  yearHeight: number;
  scrollPosition: number;
  currentDate: Date;
  isScrolling: boolean;
  onMonthClick: (year: number, month: number) => void;
}

const VisibleYears = React.memo<VisibleYearsProps>(({
  isInitialized,
  visibleYears,
  allYears,
  scrollContainerRef,
  yearHeight,
  scrollPosition,
  currentDate,
  isScrolling,
  onMonthClick
}) => {
  if (!isInitialized || visibleYears.length === 0) return null;
  
  const containerHeight = scrollContainerRef.current?.clientHeight || DEFAULT_VALUES.CONTAINER_HEIGHT;
  const yearHeightValue = yearHeight || containerHeight;
  const todayYear = new Date().getFullYear();
  const currentYear = currentDate.getFullYear();
  
  return (
    <>
      {visibleYears.map(year => {
        const yearIndex = calculateYearIndex(year, allYears);
        if (yearIndex === -1) return null;
        
        const top = calculateYearSectionPosition(yearIndex, yearHeightValue, scrollPosition);
        const { todayMonth } = getDateComparison(year, currentDate);
        
        return (
          <YearSection
            key={year}
            year={year}
            currentYear={currentYear}
            todayYear={todayYear}
            todayMonth={todayMonth}
            top={top}
            height={yearHeightValue}
            isScrolling={isScrolling}
            onMonthClick={onMonthClick}
          />
        );
      })}
    </>
  );
});

VisibleYears.displayName = 'VisibleYears';

// 2. 添加 Props 接口，支持依赖注入
export interface YearViewProps {
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: string) => void;
}

export function YearView(props: YearViewProps = {}) {
  // 从 props 或 store 获取数据和方法
  const storeCurrentDate = useCalendarStore(state => state.currentDate);
  const storeSetDate = useCalendarStore(state => state.setDate);
  const storeHandleViewChange = useCalendarStore(state => state.handleViewChange);
  
  // 优先使用 props，否则使用 store
  const currentDate = props.currentDate || storeCurrentDate;
  const setDate = props.onDateChange || storeSetDate;
  const handleViewChange = props.onViewChange || storeHandleViewChange;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDefaultView, setIsDefaultView] = useState(false);
  
  // 使用抽取的滚动 hook
  const {
    scrollContainerRef,
    scrollPosition,
    isScrolling,
    allYears,
    visibleYears,
    yearHeight,
    scrollToYear
  } = useYearScroll({
    currentYear: currentDate.getFullYear(),
    onYearChange: useCallback((year: number) => {
      if (!isDefaultView && year !== currentDate.getFullYear()) {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setDate(newDate);
      }
    }, [isDefaultView, currentDate, setDate]),
    isDefaultView
  });
  
  // 3. 合并 useEffect - 初始化和滚动状态管理
  useEffect(() => {
    // 初始化
    if (!isInitialized && scrollContainerRef.current) {
      setIsInitialized(true);
    }
    
    // 滚动时退出默认视图
    if (isScrolling && isDefaultView) {
      setIsDefaultView(false);
    }
  }, [isInitialized, scrollContainerRef, isScrolling, isDefaultView]);
  
  // 导航年份
  const navigateYear = useCallback((delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setDate(newDate);
    scrollToYear(newDate.getFullYear());
  }, [currentDate, setDate, scrollToYear]);

  // 使用键盘导航 hook（空格键回到今年）
  useYearKeyboardNavigation({
    setDate,
    setIsDefaultView,
    scrollToYear
  });
  
  // 点击月份处理
  const handleMonthClick = useCallback((year: number, month: number) => {
    const newDate = new Date(year, month, 1);
    setDate(newDate);
    handleViewChange('month');
  }, [setDate, handleViewChange]);
  
  // 使用 useMemo 缓存 props 对象，避免不必要的重渲染
  const visibleYearsProps = useMemo(() => ({
    isInitialized,
    visibleYears,
    allYears,
    scrollContainerRef,
    yearHeight,
    scrollPosition,
    currentDate,
    isScrolling,
    onMonthClick: handleMonthClick
  }), [
    isInitialized,
    visibleYears,
    allYears,
    yearHeight,
    scrollPosition,
    currentDate,
    isScrolling,
    handleMonthClick
  ]);
  
  return (
    <div className={styles.yearContainer}>
      <div className={styles.yearHeaderContainer}>
        <button 
          className={sharedStyles.navButton} 
          onClick={() => navigateYear(-NAVIGATION_STEP.FIVE_YEARS)}
          title="向前5年"
        >
          «
        </button>
        <h2 className={styles.yearHeader}>{currentDate.getFullYear()}年</h2>
        <button 
          className={sharedStyles.navButton} 
          onClick={() => navigateYear(NAVIGATION_STEP.FIVE_YEARS)}
          title="向后5年"
        >
          »
        </button>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className={styles.scrollContainer}
      >
        <VisibleYears {...visibleYearsProps} />
      </div>
    </div>
  );
}