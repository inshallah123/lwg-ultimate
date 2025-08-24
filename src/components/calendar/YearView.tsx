import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCalendarStore } from './store';
import styles from './YearView.module.css';
import sharedStyles from './shared.module.css';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', 
                     '七月', '八月', '九月', '十月', '十一月', '十二月'];

interface YearViewProps {
  onOpenSideBar?: (date: Date) => void;
}

export function YearView({ onOpenSideBar }: YearViewProps = {}) {
  const currentDate = useCalendarStore(state => state.currentDate);
  const setDate = useCalendarStore(state => state.setDate);
  const handleViewChange = useCalendarStore(state => state.handleViewChange);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDefaultView, setIsDefaultView] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollVelocityRef = useRef(0);
  
  // 年份范围
  const [yearsRange, setYearsRange] = useState({ start: -10, end: 10 });
  const [allYears, setAllYears] = useState<number[]>([]);
  const yearHeightRef = useRef(0);
  
  // 生成年份数组
  const generateYears = useCallback((centerYear: number, startOffset: number, endOffset: number) => {
    const years: number[] = [];
    for (let i = centerYear + startOffset; i <= centerYear + endOffset; i++) {
      years.push(i);
    }
    return years;
  }, []);
  
  // 初始化
  useEffect(() => {
    if (!isInitialized && scrollContainerRef.current) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const years = generateYears(currentYear, yearsRange.start, yearsRange.end);
      
      // 计算初始滚动位置（滚动到当前年份）
      const containerHeight = scrollContainerRef.current.clientHeight;
      yearHeightRef.current = containerHeight;
      
      const currentYearIndex = years.indexOf(currentYear);
      const initialScroll = currentYearIndex * yearHeightRef.current;
      
      setAllYears(years);
      setScrollPosition(initialScroll);
      setIsInitialized(true);
    }
  }, [isInitialized, generateYears, yearsRange]);
  
  // 导航年份（提前定义以避免引用错误）
  const navigateYear = useCallback((delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setDate(newDate);
    
    const targetIndex = allYears.indexOf(newDate.getFullYear());
    if (targetIndex !== -1 && scrollContainerRef.current) {
      const targetScroll = targetIndex * yearHeightRef.current;
      setScrollPosition(targetScroll);
    }
  }, [currentDate, setDate, allYears, setScrollPosition]);

  // 年视图专用滚轮处理（加速滚动）
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // 年视图使用更快的滚动速度
      const scrollSpeed = 0.8; // 提高滚动速度
      const delta = e.deltaY * scrollSpeed;
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        setScrollPosition(prev => {
          const newPosition = prev + delta;
          scrollVelocityRef.current = Math.abs(delta);
          return Math.max(0, newPosition);
        });
      });
      
      setIsScrolling(true);
      setIsDefaultView(false);
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        scrollVelocityRef.current = 0;
      }, 150); // 缩短超时时间，让滚动更响应
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [setScrollPosition, setIsScrolling, setIsDefaultView]);
  
  // 键盘导航（空格键回到今天，PageUp/PageDown快速导航）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // 空格键回到今天
      if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const today = new Date();
        setDate(today);
        setIsDefaultView(true);
        
        // 滚动到今年
        const currentYearIndex = allYears.indexOf(today.getFullYear());
        if (currentYearIndex !== -1 && scrollContainerRef.current) {
          const targetScroll = currentYearIndex * yearHeightRef.current;
          setScrollPosition(targetScroll);
        }
        
        setTimeout(() => setIsDefaultView(false), 100);
      }
      
      // PageUp - 上一年
      if (e.code === 'PageUp') {
        e.preventDefault();
        navigateYear(-1);
      }
      
      // PageDown - 下一年
      if (e.code === 'PageDown') {
        e.preventDefault();
        navigateYear(1);
      }
      
      // Ctrl+PageUp - 快速向前5年
      if (e.code === 'PageUp' && e.ctrlKey) {
        e.preventDefault();
        navigateYear(-5);
      }
      
      // Ctrl+PageDown - 快速向后5年
      if (e.code === 'PageDown' && e.ctrlKey) {
        e.preventDefault();
        navigateYear(5);
      }
      
      // Home - 跳到年份列表开始
      if (e.code === 'Home' && e.ctrlKey) {
        e.preventDefault();
        setScrollPosition(0);
      }
      
      // End - 跳到年份列表结束
      if (e.code === 'End' && e.ctrlKey) {
        e.preventDefault();
        const lastPosition = (allYears.length - 1) * yearHeightRef.current;
        setScrollPosition(lastPosition);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setDate, allYears, navigateYear]);
  
  // 更新当前年份（基于滚动位置）
  useEffect(() => {
    if (allYears.length === 0 || !isInitialized || isDefaultView) return;
    
    const yearHeight = yearHeightRef.current || 400;
    const currentIndex = Math.round(scrollPosition / yearHeight);
    
    if (allYears[currentIndex]) {
      const newYear = allYears[currentIndex];
      const newDate = new Date(currentDate);
      newDate.setFullYear(newYear);
      
      if (newYear !== currentDate.getFullYear()) {
        setDate(newDate);
      }
    }
  }, [scrollPosition, allYears, currentDate, setDate, isInitialized, isDefaultView]);
  
  // 无限滚动加载更多年份
  useEffect(() => {
    if (allYears.length === 0) return;
    
    const yearHeight = yearHeightRef.current || 400;
    const currentIndex = Math.round(scrollPosition / yearHeight);
    const velocity = scrollVelocityRef.current;
    
    const baseThreshold = 3;
    const dynamicThreshold = baseThreshold + Math.floor(velocity / 10);
    
    let needsUpdate = false;
    let newStart = yearsRange.start;
    let newEnd = yearsRange.end;
    
    const yearsToLoad = velocity > 30 ? 10 : 5;
    
    if (currentIndex < dynamicThreshold) {
      newStart = yearsRange.start - yearsToLoad;
      needsUpdate = true;
    }
    
    if (currentIndex > allYears.length - dynamicThreshold) {
      newEnd = yearsRange.end + yearsToLoad;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      const viewingYear = allYears[currentIndex] || currentDate.getFullYear();
      const centerYear = new Date().getFullYear();
      const years = generateYears(centerYear, newStart, newEnd);
      
      const newViewingIndex = years.indexOf(viewingYear);
      if (newViewingIndex !== -1) {
        const newScrollPosition = newViewingIndex * yearHeight;
        
        setYearsRange({ start: newStart, end: newEnd });
        setAllYears(years);
        setScrollPosition(newScrollPosition);
      }
    }
  }, [scrollPosition, allYears, currentDate, yearsRange, generateYears]);
  
  // 点击月份处理
  const handleMonthClick = useCallback((year: number, month: number) => {
    // 创建点击年月的第一天
    const newDate = new Date(year, month, 1);
    setDate(newDate);
    
    // 切换到月视图
    handleViewChange('month');
  }, [setDate, handleViewChange]);
  
  // 渲染可见的年份
  const renderVisibleYears = () => {
    if (!isInitialized || allYears.length === 0) return null;
    
    const containerHeight = scrollContainerRef.current?.clientHeight || 600;
    const yearHeight = containerHeight; // 每个年份占满整个容器高度
    
    const bufferYears = isScrolling ? 2 : 1;
    const visibleStartIndex = Math.floor(scrollPosition / yearHeight) - bufferYears;
    const visibleEndIndex = Math.ceil((scrollPosition + containerHeight) / yearHeight) + bufferYears;
    const startIndex = Math.max(0, visibleStartIndex);
    const endIndex = Math.min(allYears.length, visibleEndIndex);
    
    const yearViews = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const year = allYears[i];
      if (!year) continue;
      
      const top = i * yearHeight - scrollPosition;
      const today = new Date();
      const isCurrentYear = year === currentDate.getFullYear();
      const isTodayYear = year === today.getFullYear();
      const todayMonth = today.getMonth();
      
      yearViews.push(
        <div
          key={year}
          className={`${styles.yearSection} ${isCurrentYear ? styles.currentYear : ''}`}
          style={{
            position: 'absolute',
            top: `${top}px`,
            width: '100%',
            height: `${yearHeight}px`,
            willChange: isScrolling ? 'transform' : 'auto',
          }}
        >
          <div className={styles.monthsGrid}>
            {MONTH_NAMES.map((monthName, monthIndex) => {
              // 只有在今天所在的年份，才高亮今天所在的月份
              const isCurrentMonth = isTodayYear && monthIndex === todayMonth;
              const isToday = isCurrentMonth;
              
              return (
                <div
                  key={monthIndex}
                  className={`
                    ${styles.monthCard} 
                    ${isCurrentMonth ? styles.currentMonth : ''}
                    ${isToday ? styles.todayMonth : ''}
                  `}
                  onClick={() => handleMonthClick(year, monthIndex)}
                >
                  <div className={styles.monthNumber}>{monthIndex + 1}</div>
                  <div className={styles.monthName}>{monthName}</div>
                  {isToday && <div className={styles.todayIndicator} />}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return yearViews;
  };
  
  return (
    <div className={styles.yearContainer}>
      <div className={styles.yearHeaderContainer}>
        <button 
          className={sharedStyles.navButton} 
          onClick={() => navigateYear(-5)}
          title="向前5年 (Ctrl+PageUp)"
        >
          «
        </button>
        <button 
          className={sharedStyles.navButton} 
          onClick={() => navigateYear(-1)}
          title="上一年 (PageUp)"
        >
          ‹
        </button>
        <h2 className={styles.yearHeader}>{currentDate.getFullYear()}年</h2>
        <button 
          className={sharedStyles.navButton} 
          onClick={() => navigateYear(1)}
          title="下一年 (PageDown)"
        >
          ›
        </button>
        <button 
          className={sharedStyles.navButton} 
          onClick={() => navigateYear(5)}
          title="向后5年 (Ctrl+PageDown)"
        >
          »
        </button>
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
        {renderVisibleYears()}
      </div>
    </div>
  );
}