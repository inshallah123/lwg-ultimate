import React, { useCallback, useMemo } from 'react';
import { useCalendarStore } from '../store';
import { useSidebarStore } from '../../Sidebar/store';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { MonthHeader } from './MonthHeader';
import { WeekdayHeader } from './WeekdayHeader';
import { useMonthScroll, useMonthKeyboardNavigation } from '../hooks';
import { VIEW_CONFIG, BUFFER_ROWS } from '../constants/monthview';
import { calculateVisibleContent } from '../utils/monthCalculation';
import { CalendarRow } from './components/CalendarRow';
import styles from './MonthView.module.css';

// 优化后的可见内容组件
interface VisibleContentProps {
  isInitialized: boolean;
  allDays: Date[];
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  rowHeight: number | null;
  scrollPosition: number;
  currentDate: Date;
  isScrolling: boolean;
  onCellClick: (day: Date) => void;
}

const VisibleContent = React.memo<VisibleContentProps>(({ 
  isInitialized,
  allDays,
  scrollContainerRef,
  rowHeight,
  scrollPosition,
  currentDate,
  isScrolling,
  onCellClick
}) => {
  if (!isInitialized || allDays.length === 0) return null;
  
  const containerHeight = scrollContainerRef.current?.clientHeight || 600;
  const effectiveRowHeight = rowHeight || Math.floor(containerHeight / VIEW_CONFIG.ROWS_PER_SCREEN);
  
  // 使用抽离的计算函数
  const {startIndex, endIndex } = calculateVisibleContent({
    scrollPosition,
    containerHeight,
    rowHeight: effectiveRowHeight,
    isScrolling,
    daysPerWeek: VIEW_CONFIG.DAYS_PER_WEEK,
    bufferRowsIdle: BUFFER_ROWS.IDLE,
    bufferRowsScrolling: BUFFER_ROWS.SCROLLING
  });
  
  const clampedEndIndex = Math.min(allDays.length, endIndex);
  
  // 生成行组件
  const rows = [];
  for (let rowIndex = Math.floor(startIndex / VIEW_CONFIG.DAYS_PER_WEEK); 
       rowIndex < Math.ceil(clampedEndIndex / VIEW_CONFIG.DAYS_PER_WEEK); 
       rowIndex++) {
    
    rows.push(
      <CalendarRow
        key={`row-${rowIndex}`}
        rowIndex={rowIndex}
        allDays={allDays}
        startIndex={startIndex}
        endIndex={clampedEndIndex}
        currentDate={currentDate}
        isScrolling={isScrolling}
        scrollPosition={scrollPosition}
        rowHeight={effectiveRowHeight}
        containerHeight={containerHeight}
        onCellClick={onCellClick}
      />
    );
  }
  
  return <>{rows}</>;
});

VisibleContent.displayName = 'VisibleContent';

// 支持依赖注入的 Props 接口
export interface MonthViewProps {
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onOpenSideBar?: (date: Date) => void;
}

export function MonthView(props: MonthViewProps) {
  // 从 props 或 store 获取数据和方法
  const storeCurrentDate = useCalendarStore(state => state.currentDate);
  const storeSetDate = useCalendarStore(state => state.setDate);
  const getMonthHeader = useCalendarStore(state => state.getMonthHeader);
  const openEventForm = useSidebarStore(state => state.openEventForm);
  
  // 优先使用 props，否则使用 store
  const currentDate = props.currentDate ?? storeCurrentDate;
  const setDate = props.onDateChange ?? storeSetDate;
  const onOpenSideBar = props.onOpenSideBar;
  
  // 使用月视图滚动 hook
  const {
    scrollContainerRef,
    scrollPosition,
    setScrollPosition,
    isScrolling,
    allDays,
    rowHeight,
      resetToDate,
    isInitialized
  } = useMonthScroll({
    currentDate,
    onMonthChange: setDate
  });
  
  // 使用月视图键盘导航 hook
  const { navigateMonth } = useMonthKeyboardNavigation({
    currentDate,
    allDays,
    scrollContainerRef,
    onDateChange: setDate,
    onScrollPositionChange: setScrollPosition,
    onReset: () => {
      // 重置到今天（重新生成日期范围并滚动）
      const today = new Date();
      setDate(today);
      resetToDate(today);
    }
  });
  
  // 处理单元格点击 - 使用 useCallback 包装回调函数以优化性能
  const handleSingleClick = useCallback(
    (day: Date) => onOpenSideBar?.(day),
    [onOpenSideBar]
  );
  
  const handleDoubleClick = useCallback(
    (day: Date) => openEventForm(day),
    [openEventForm]
  );
  
  const handleCellClick = useDoubleClick(
    handleSingleClick,
    handleDoubleClick
  );
  
  // 月份导航按钮处理
  const handlePrevMonth = useCallback(() => navigateMonth(-1), [navigateMonth]);
  const handleNextMonth = useCallback(() => navigateMonth(1), [navigateMonth]);
  
  // 使用 useMemo 缓存 props 对象，避免不必要的重渲染
  const visibleContentProps = useMemo(() => ({
    isInitialized,
    allDays,
    scrollContainerRef,
    rowHeight,
    scrollPosition,
    currentDate,
    isScrolling,
    onCellClick: handleCellClick
  }), [
    isInitialized,
    allDays,
    scrollContainerRef,
    rowHeight,
    scrollPosition,
    currentDate,
    isScrolling,
    handleCellClick
  ]);
  
  return (
    <div className={styles.monthContainer}>
      <MonthHeader 
        monthHeader={getMonthHeader()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <WeekdayHeader />
      <div 
        ref={scrollContainerRef}
        className={styles.scrollContainer}
        role="grid"
        aria-label="月历视图"
        tabIndex={0}
      >
        <VisibleContent {...visibleContentProps} />
      </div>
    </div>
  );
}