import { useEffect, useRef } from 'react';
import { useCalendarStore } from '../store';

export function useCalendarNavigation() {
  const viewMode = useCalendarStore(state => state.viewMode);
  const navigateMonth = useCalendarStore(state => state.navigateMonth);
  const navigateWeek = useCalendarStore(state => state.navigateWeek);
  const navigateYear = useCalendarStore(state => state.navigateYear);
  const goToToday = useCalendarStore(state => state.goToToday);
  
  // 使用 ref 存储最新的值，避免重新绑定事件
  const storeRef = useRef({
    viewMode,
    navigateMonth,
    navigateWeek,
    navigateYear,
    goToToday
  });
  
  useEffect(() => {
    storeRef.current = {
      viewMode,
      navigateMonth,
      navigateWeek,
      navigateYear,
      goToToday
    };
  }, [viewMode, navigateMonth, navigateWeek, navigateYear, goToToday]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // 如果用户正在输入，不处理快捷键
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { viewMode, navigateMonth, navigateWeek, navigateYear, goToToday } = storeRef.current;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (viewMode === 'month') {
            navigateMonth(-1);
          } else if (viewMode === 'week') {
            navigateWeek(-1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (viewMode === 'month') {
            navigateMonth(1);
          } else if (viewMode === 'week') {
            navigateWeek(1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (viewMode === 'month') {
            navigateYear(-1);
          } else if (viewMode === 'week') {
            navigateMonth(-1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (viewMode === 'month') {
            navigateYear(1);
          } else if (viewMode === 'week') {
            navigateMonth(1);
          }
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          goToToday();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []); // 空依赖数组，只绑定一次
}