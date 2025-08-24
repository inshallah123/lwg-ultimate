import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCalendarStore } from './store';
import { useSidebarStore } from '../Sidebar/store';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { DayCell, WeekdayHeader, MonthHeader } from './components';
import { useWheelHandler, useKeyboardNavigation } from './hooks';
import styles from './MonthView.module.css';

interface MonthViewProps {
  onOpenSideBar?: (date: Date) => void;
}

export function MonthView({ onOpenSideBar }: MonthViewProps = {}) {
  const currentDate = useCalendarStore(state => state.currentDate);
  const setDate = useCalendarStore(state => state.setDate);
  const getMonthHeader = useCalendarStore(state => state.getMonthHeader);
  const openEventForm = useSidebarStore(state => state.openEventForm);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDefaultView, setIsDefaultView] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const rowHeightRef = useRef(0);
  
  // 状态管理
  const [allDays, setAllDays] = useState<Date[]>([]);
  const [, setCenterIndex] = useState(0);
  const [monthsRange, setMonthsRange] = useState({ start: -6, end: 6 });
  const scrollVelocityRef = useRef(0);
  
  // 生成连续的日期数组
  const generateContinuousDays = useCallback((centerDate: Date, startMonths: number, endMonths: number) => {
    const days: Date[] = [];
    const startDate = new Date(centerDate);
    startDate.setMonth(startDate.getMonth() + startMonths);
    startDate.setDate(1);
    // 调整到周日开始
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(centerDate);
    endDate.setMonth(endDate.getMonth() + endMonths);
    endDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // 最后一天
    // 调整到周六结束
    const daysToAdd = 6 - endDate.getDay();
    if (daysToAdd > 0) {
      endDate.setDate(endDate.getDate() + daysToAdd);
    }
    
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    // 找到今天或当前月第一天在数组中的位置
    const targetDate = new Date(centerDate);
    targetDate.setDate(1);
    const centerIdx = days.findIndex(d => 
      d.getFullYear() === targetDate.getFullYear() && 
      d.getMonth() === targetDate.getMonth() &&
      d.getDate() === 1
    );
    
    return { days, centerIndex: Math.max(0, centerIdx) };
  }, []);
  
  // 初始化日期数组
  useEffect(() => {
    if (!isInitialized && scrollContainerRef.current) {
      const today = new Date();
      const { days, centerIndex } = generateContinuousDays(today, monthsRange.start, monthsRange.end);
      
      // 立即计算初始滚动位置
      const rowHeight = Math.floor(scrollContainerRef.current.clientHeight / 6);
      rowHeightRef.current = rowHeight;
      
      const todayIndex = days.findIndex(d => 
        d.getFullYear() === today.getFullYear() && 
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
      
      let initialScroll: number;
      if (todayIndex !== -1) {
        const todayRow = Math.floor(todayIndex / 7);
        initialScroll = Math.round(Math.max(0, (todayRow - 2) * rowHeight));
      } else {
        const firstDayOfMonth = days.findIndex(d => 
          d.getFullYear() === today.getFullYear() && 
          d.getMonth() === today.getMonth() &&
          d.getDate() === 1
        );
        if (firstDayOfMonth !== -1) {
          const firstDayRow = Math.floor(firstDayOfMonth / 7);
          initialScroll = Math.max(0, (firstDayRow - 2) * rowHeight);
        } else {
          initialScroll = Math.floor(centerIndex / 7) * rowHeight;
        }
      }
      
      // 同步设置所有状态
      setAllDays(days);
      setCenterIndex(centerIndex);
      setScrollPosition(initialScroll);
      // 确保设置今天的日期，而不是其他日期
      setDate(new Date());
      setIsInitialized(true);
    }
  }, [isInitialized, generateContinuousDays, setDate, monthsRange.start, monthsRange.end]);
  
  // 使用滚轮处理 hook
  useWheelHandler(scrollContainerRef, { setScrollPosition }, setIsScrolling, setIsDefaultView, scrollVelocityRef);
  
  // 使用键盘导航 hook（仅处理空格键）
  useKeyboardNavigation({
    setDate,
    setIsDefaultView,
    generateContinuousDays,
    setMonthsRange,
    setAllDays,
    setCenterIndex,
    setScrollPosition,
    scrollContainerRef
  });
  
  
  // 更新当前月份（仅基于滚动位置，避免与键盘导航冲突）
  useEffect(() => {
    if (allDays.length === 0 || !isInitialized) return;
    
    if (isDefaultView) return;
    
    const rowHeight = rowHeightRef.current || 100;
    const currentRow = Math.floor((scrollPosition + rowHeight * 3) / rowHeight);
    const currentDayIndex = currentRow * 7 + 3;
    
    if (allDays[currentDayIndex]) {
      const newDate = allDays[currentDayIndex];
      if (newDate.getMonth() !== currentDate.getMonth() || 
          newDate.getFullYear() !== currentDate.getFullYear()) {
        // 只在滚动时更新，不在键盘导航时更新
        setDate(newDate);
      }
    }
  }, [scrollPosition, allDays, setDate, isInitialized, isDefaultView]);
  
  // 检查是否需要加载更多日期（无限滚动）
  useEffect(() => {
    if (allDays.length === 0) return;
    
    const rowHeight = rowHeightRef.current || 100;
    const totalRows = Math.floor(allDays.length / 7);
    const currentRow = Math.floor((scrollPosition + rowHeight * 3) / rowHeight);
    
    const velocity = scrollVelocityRef.current;
    const baseThreshold = 12 * 4;
    const dynamicThreshold = baseThreshold + Math.floor(velocity / 5);
    
    let needsUpdate = false;
    let newStart = monthsRange.start;
    let newEnd = monthsRange.end;
    
    const monthsToLoad = velocity > 30 ? 12 : velocity > 15 ? 9 : 6;
    
    if (currentRow < dynamicThreshold) {
      newStart = monthsRange.start - monthsToLoad;
      needsUpdate = true;
    }
    
    if (currentRow > totalRows - dynamicThreshold) {
      newEnd = monthsRange.end + monthsToLoad;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      const currentDayIndex = currentRow * 7 + 3;
      const viewingDate = allDays[currentDayIndex] || currentDate;
      
      const { days, centerIndex: newCenterIndex } = generateContinuousDays(currentDate, newStart, newEnd);
      
      const newViewingIndex = days.findIndex(d => 
        d.getFullYear() === viewingDate.getFullYear() && 
        d.getMonth() === viewingDate.getMonth() &&
        d.getDate() === viewingDate.getDate()
      );
      
      if (newViewingIndex !== -1) {
        const newRow = Math.floor(newViewingIndex / 7);
        const newScrollPosition = newRow * rowHeight - (currentRow * rowHeight - scrollPosition);
        
        setMonthsRange({ start: newStart, end: newEnd });
        setAllDays(days);
        setCenterIndex(newCenterIndex);
        setScrollPosition(newScrollPosition);
      }
    }
  }, [scrollPosition, allDays, currentDate, monthsRange, generateContinuousDays]);
  
  const handleCellClick = useDoubleClick(
    (day: Date) => onOpenSideBar?.(day),
    (day: Date) => openEventForm(day)
  );
  
  // 处理月份导航
  const navigateMonth = useCallback((delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setDate(newDate);
    
    const targetIndex = allDays.findIndex(d => 
      d.getFullYear() === newDate.getFullYear() && 
      d.getMonth() === newDate.getMonth() &&
      d.getDate() === 1
    );
    
    if (targetIndex !== -1 && scrollContainerRef.current) {
      const rowHeight = Math.floor(scrollContainerRef.current.clientHeight / 6);
      const targetScroll = Math.round(Math.floor(targetIndex / 7) * rowHeight);
      setScrollPosition(targetScroll);
    }
  }, [currentDate, setDate, allDays]);
  
  const handlePrevMonth = useCallback(() => navigateMonth(-1), [navigateMonth]);
  const handleNextMonth = useCallback(() => navigateMonth(1), [navigateMonth]);
  
  // 渲染可见的日期
  const renderVisibleDays = () => {
    if (!isInitialized || allDays.length === 0) return null;
    
    const containerHeight = scrollContainerRef.current?.clientHeight || 600;
    const rowHeight = Math.floor(containerHeight / 6);
    
    const bufferRows = isScrolling ? 6 : 4;
    const visibleStartRow = Math.floor(scrollPosition / rowHeight) - bufferRows;
    const visibleEndRow = Math.ceil((scrollPosition + containerHeight) / rowHeight) + bufferRows;
    const startIndex = Math.max(0, visibleStartRow * 7);
    const endIndex = Math.min(allDays.length, visibleEndRow * 7);
    
    const cells = [];
    for (let i = startIndex; i < endIndex; i++) {
      const day = allDays[i];
      if (!day) continue;
      
      const row = Math.floor(i / 7);
      const col = i % 7;
      const top = Math.round(row * rowHeight - scrollPosition);
      const left = (col / 7) * 100;
      
      const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      
      // 判断是否为当前视图月份
      const viewMonth = currentDate.getMonth();
      const viewYear = currentDate.getFullYear();
      const isCurrentMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
      
      cells.push(
        <DayCell
          key={dayKey}
          day={day}
          isCurrentMonth={isCurrentMonth}
          isScrolling={isScrolling}
          isDefaultView={isDefaultView}
          row={row}
          scrollPosition={scrollPosition}
          rowHeight={rowHeight}
          containerHeight={containerHeight}
          onClick={handleCellClick}
          style={{
            position: 'absolute',
            top: `${top}px`,
            left: `${left}%`,
            width: `${100 / 7}%`,
            height: `${rowHeight}px`,
            willChange: isScrolling ? 'transform' : 'auto', // 滚动时优化GPU渲染
          }}
        />
      );
    }
    
    return cells;
  };
  
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
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {renderVisibleDays()}
      </div>
    </div>
  );
}