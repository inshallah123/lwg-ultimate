import React, { useEffect, useCallback } from 'react';
import { isToday } from '@/utils/dateHelpers';
import { NAVIGATION, VIEW_CONFIG } from '../constants/monthview';

interface UseMonthKeyboardNavigationProps {
  currentDate: Date;
  allDays: Date[];
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onDateChange: (date: Date) => void;
  onScrollPositionChange: (position: number) => void;
  onReset?: () => void;
}

export function useMonthKeyboardNavigation({
  currentDate,
  allDays,
  scrollContainerRef,
  onDateChange,
  onScrollPositionChange,
  onReset
}: UseMonthKeyboardNavigationProps) {
  
  // 导航到今天
  const navigateToToday = useCallback(() => {
    const today = new Date();
    onDateChange(today);
    
    // 如果今天在当前日期范围内，直接滚动到今天
    const todayIndex = allDays.findIndex(d => isToday(d));
    if (todayIndex !== -1 && scrollContainerRef.current) {
      const rowHeight = Math.floor(scrollContainerRef.current.clientHeight / VIEW_CONFIG.ROWS_PER_SCREEN);
      const todayRow = Math.floor(todayIndex / VIEW_CONFIG.DAYS_PER_WEEK);
      const targetScroll = Math.round(Math.max(0, (todayRow - NAVIGATION.CENTER_ROW_OFFSET) * rowHeight));
      onScrollPositionChange(targetScroll);
    } else if (onReset) {
      // 如果今天不在范围内，重置整个视图
      onReset();
    }
  }, [allDays, scrollContainerRef, onDateChange, onScrollPositionChange, onReset]);
  
  // 月份导航
  const navigateMonth = useCallback((delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    onDateChange(newDate);
    
    const targetIndex = allDays.findIndex(d => 
      d.getFullYear() === newDate.getFullYear() && 
      d.getMonth() === newDate.getMonth() &&
      d.getDate() === 1
    );
    
    if (targetIndex !== -1 && scrollContainerRef.current) {
      const rowHeight = Math.floor(scrollContainerRef.current.clientHeight / VIEW_CONFIG.ROWS_PER_SCREEN);
      const targetScroll = Math.round(Math.floor(targetIndex / VIEW_CONFIG.DAYS_PER_WEEK) * rowHeight);
      onScrollPositionChange(targetScroll);
    }
  }, [currentDate, allDays, scrollContainerRef, onDateChange, onScrollPositionChange]);
  
  // 监听键盘事件
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 空格键 - 回到今天
      if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigateToToday();
      }
      
      // 方向键导航
      if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigateMonth(-1);
      }
      
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigateMonth(1);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigateToToday, navigateMonth]);
  
  return {
    navigateToToday,
    navigateMonth
  };
}