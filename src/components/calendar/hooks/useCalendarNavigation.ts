import { useEffect } from 'react';
import { useCalendarStore } from '../store';

export function useCalendarNavigation() {
  const viewMode = useCalendarStore(state => state.viewMode);
  const navigateMonth = useCalendarStore(state => state.navigateMonth);
  const navigateWeek = useCalendarStore(state => state.navigateWeek);
  const navigateYear = useCalendarStore(state => state.navigateYear);
  const goToToday = useCalendarStore(state => state.goToToday);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // 如果用户正在输入，不处理快捷键
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyMap: Record<string, () => void> = {
        'ArrowLeft': () => {
          if (viewMode === 'month') {
            navigateMonth(-1);
          } else if (viewMode === 'week') {
            navigateWeek(-1);
          }
        },
        'ArrowRight': () => {
          if (viewMode === 'month') {
            navigateMonth(1);
          } else if (viewMode === 'week') {
            navigateWeek(1);
          }
        },
        'ArrowUp': () => {
          if (viewMode === 'month') {
            navigateYear(-1);
          } else if (viewMode === 'week') {
            navigateMonth(-1);
          }
        },
        'ArrowDown': () => {
          if (viewMode === 'month') {
            navigateYear(1);
          } else if (viewMode === 'week') {
            navigateMonth(1);
          }
        },
        ' ': goToToday,
        'Enter': goToToday
      };
      
      if (keyMap[e.key]) {
        e.preventDefault();
        keyMap[e.key]();
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewMode, navigateMonth, navigateWeek, navigateYear, goToToday]);
}