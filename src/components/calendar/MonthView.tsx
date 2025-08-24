import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCalendarStore } from './store';
import { useSidebarStore } from '../Sidebar/store';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { isToday, WEEKDAY_NAMES_SHORT } from '@/utils/dateHelpers';
import { getLunarDateInfo } from '@/utils/lunarDate';
import { EventIndicator } from './EventIndicator';
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
  const [allDays, setAllDays] = useState<Date[]>([]);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const rowHeightRef = useRef(0);
  const [monthsRange, setMonthsRange] = useState({ start: -6, end: 6 }); // 动态范围
  const lastScrollPositionRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false); // 添加初始化标志
  const [scrollPosition, setScrollPosition] = useState(0);
  const rafRef = useRef<number>();
  const [isDefaultView, setIsDefaultView] = useState(false); // 是否处于默认月视图（按空格后）
  
  // 生成连续的日期数组（根据动态范围）
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
      
      let initialScroll = 0;
      if (todayIndex !== -1) {
        const todayRow = Math.floor(todayIndex / 7);
        // 让今天在第三行（索引2），这样上面有2行，下面有3行，共6行
        // 使用整数像素值，避免小数导致的显示问题
        initialScroll = Math.round(Math.max(0, (todayRow - 2) * rowHeight));
      } else {
        // 如果没有今天，就显示当月第一天在第三行
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
      setDate(today);
      setIsInitialized(true);
    }
  }, [isInitialized, generateContinuousDays, setDate]);
  
  // 处理滚轮事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || allDays.length === 0) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const scrollSpeed = 0.25; // 稍微减慢滚动速度
      const delta = e.deltaY * scrollSpeed;
      
      // 取消之前的动画帧
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // 使用 requestAnimationFrame 优化性能
      rafRef.current = requestAnimationFrame(() => {
        setScrollPosition(prev => {
          const newPosition = prev + delta;
          
          // 计算滚动速度
          scrollVelocityRef.current = Math.abs(delta);
          lastScrollPositionRef.current = newPosition;
          
          return Math.max(0, newPosition);
        });
      });
      
      setIsScrolling(true);
      setIsDefaultView(false); // 滚动时退出默认视图模式
      
      // 清除之前的timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // 停止滚动后恢复静态视图
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scrollVelocityRef.current = 0;
      }, 200); // 稍微延长等待时间
    };
    
    // 使用 passive: false 以允许 preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [allDays.length]);
  
  // 更新当前月份
  useEffect(() => {
    if (allDays.length === 0 || !isInitialized) return; // 初始化完成前不更新
    
    // 在默认视图模式下不自动更新月份，保持显示今天所在的月份
    if (isDefaultView) return;
    
    const rowHeight = rowHeightRef.current || 100;
    const currentRow = Math.floor((scrollPosition + rowHeight * 3) / rowHeight);
    const currentDayIndex = currentRow * 7 + 3;
    
    if (allDays[currentDayIndex]) {
      const newDate = allDays[currentDayIndex];
      if (newDate.getMonth() !== currentDate.getMonth() || 
          newDate.getFullYear() !== currentDate.getFullYear()) {
        setDate(newDate);
      }
    }
  }, [scrollPosition, allDays, currentDate, setDate, isInitialized, isDefaultView]);
  
  // 检查是否需要加载更多日期（无限滚动）
  useEffect(() => {
    if (allDays.length === 0) return;
    
    const rowHeight = rowHeightRef.current || 100;
    const totalRows = Math.floor(allDays.length / 7);
    const currentRow = Math.floor((scrollPosition + rowHeight * 3) / rowHeight);
    
    // 根据滚动速度动态调整加载阈值
    const velocity = scrollVelocityRef.current;
    const baseThreshold = 12 * 4; // 增加基础阈值到3个月
    const dynamicThreshold = baseThreshold + Math.floor(velocity / 5); // 更敏感的速度响应
    
    let needsUpdate = false;
    let newStart = monthsRange.start;
    let newEnd = monthsRange.end;
    
    // 根据速度决定加载的月份数量
    const monthsToLoad = velocity > 30 ? 12 : velocity > 15 ? 9 : 6; // 分级加载
    
    // 检查是否接近顶部
    if (currentRow < dynamicThreshold) {
      newStart = monthsRange.start - monthsToLoad;
      needsUpdate = true;
    }
    
    // 检查是否接近底部
    if (currentRow > totalRows - dynamicThreshold) {
      newEnd = monthsRange.end + monthsToLoad;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      // 记录当前查看的日期
      const currentDayIndex = currentRow * 7 + 3;
      const viewingDate = allDays[currentDayIndex] || currentDate;
      
      // 生成新的日期数组
      const { days, centerIndex: newCenterIndex } = generateContinuousDays(currentDate, newStart, newEnd);
      
      // 找到当前查看日期在新数组中的位置
      const newViewingIndex = days.findIndex(d => 
        d.getFullYear() === viewingDate.getFullYear() && 
        d.getMonth() === viewingDate.getMonth() &&
        d.getDate() === viewingDate.getDate()
      );
      
      if (newViewingIndex !== -1) {
        // 计算新的滚动位置以保持视图稳定
        const newRow = Math.floor(newViewingIndex / 7);
        const newScrollPosition = newRow * rowHeight - (currentRow * rowHeight - scrollPosition);
        
        setMonthsRange({ start: newStart, end: newEnd });
        setAllDays(days);
        setCenterIndex(newCenterIndex);
        setScrollPosition(newScrollPosition);
      }
    }
  }, [scrollPosition, allDays, currentDate, monthsRange, generateContinuousDays]);
  
  // 处理空格键回到今天
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const today = new Date();
        setDate(today);
        setIsDefaultView(true); // 设置为默认视图模式
        
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
            // 让今天固定在第三行，确保显示完整的6行
            const targetScroll = Math.round(Math.max(0, (todayRow - 2) * rowHeight));
            setScrollPosition(targetScroll);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setDate, generateContinuousDays]);
  
  const handleCellClick = useDoubleClick(
    (day: Date) => onOpenSideBar?.(day),
    (day: Date) => openEventForm(day)
  );
  
  // 渲染可见的日期
  const renderVisibleDays = () => {
    // 如果还没初始化完成，不渲染
    if (!isInitialized || allDays.length === 0) return null;
    
    const containerHeight = scrollContainerRef.current?.clientHeight || 600;
    const rowHeight = Math.floor(containerHeight / 6);
    
    // 增加渲染缓冲区，特别是在滚动时
    const bufferRows = isScrolling ? 6 : 4; // 滚动时增加缓冲
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
      const lunarInfo = getLunarDateInfo(day);
      
      // 判断是否为当前视图月份
      const viewMonth = currentDate.getMonth();
      const viewYear = currentDate.getFullYear();
      const isCurrentMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
      
      // 根据滚动状态决定样式
      let useCurrentStyle = isCurrentMonth;
      
      if (isDefaultView && !isScrolling) {
        // 默认视图（按空格后）：固定第1、6行涂灰，2-5行正常
        const visibleRow = Math.floor((i - startIndex) / 7);
        const absoluteRow = row - Math.floor(scrollPosition / rowHeight);
        useCurrentStyle = absoluteRow >= 1 && absoluteRow <= 4; // 第2-5行为正常样式
      } else if (isScrolling) {
        // 滚动时：滑动窗口效果，中心附近6行用当月样式
        const centerRow = Math.floor((scrollPosition + containerHeight / 2) / rowHeight);
        const distanceFromCenter = Math.abs(row - centerRow);
        useCurrentStyle = distanceFromCenter <= 3;
      } else {
        // 静止时：只有当前月份用当月样式
        useCurrentStyle = isCurrentMonth;
      }
      
      cells.push(
        <div
          key={dayKey}
          className={`${styles.dayCell} ${
            useCurrentStyle ? styles.currentMonth : styles.otherMonth
          } ${isToday(day) ? styles.today : ''}`}
          style={{
            position: 'absolute',
            top: `${top}px`,
            left: `${left}%`,
            width: `${100 / 7}%`,
            height: `${rowHeight}px`,
            transition: isScrolling ? 'none' : 'all 0.2s ease-out' // 滚动时禁用过渡
          }}
          onClick={() => handleCellClick(day)}
        >
          <div className={styles.dayCellHeader}>
            <span className={styles.dayNumber}>{day.getDate()}</span>
            <div className={styles.lunarInfo}>
              {lunarInfo.festival && (
                <span className={styles.festival}>{lunarInfo.festival}</span>
              )}
              {!lunarInfo.festival && lunarInfo.solarTerm && (
                <span className={styles.solarTerm}>{lunarInfo.solarTerm}</span>
              )}
              {!lunarInfo.festival && !lunarInfo.solarTerm && lunarInfo.lunar && (
                <span className={styles.lunar}>{lunarInfo.lunar}</span>
              )}
              {lunarInfo.workday && (
                <span className={styles.workday}>{lunarInfo.workday}</span>
              )}
            </div>
          </div>
          <EventIndicator 
            date={day} 
            view="month"
            maxDisplay={3}
          />
        </div>
      );
    }
    
    return cells;
  };
  
  return (
    <div className={styles.monthContainer}>
      <div className={styles.monthHeaderContainer}>
        <button className={styles.monthNavButton} onClick={() => {
          const newDate = new Date(currentDate);
          newDate.setMonth(newDate.getMonth() - 1);
          setDate(newDate);
          
          // 找到新月份在当前数组中的位置并滚动
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
        }}>
          ‹
        </button>
        <h2 className={styles.monthHeader}>{getMonthHeader()}</h2>
        <button className={styles.monthNavButton} onClick={() => {
          const newDate = new Date(currentDate);
          newDate.setMonth(newDate.getMonth() + 1);
          setDate(newDate);
          
          // 找到新月份在当前数组中的位置并滚动
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
        }}>
          ›
        </button>
      </div>
      <div className={styles.weekdayRow}>
        {WEEKDAY_NAMES_SHORT.map(day => (
          <div key={day} className={styles.weekdayHeader}>
            {day}
          </div>
        ))}
      </div>
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