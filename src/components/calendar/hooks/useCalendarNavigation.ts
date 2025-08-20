import React, { useCallback, useEffect } from 'react';

export function useCalendarNavigation(
  setDate: React.Dispatch<React.SetStateAction<Date>>,
  mode: 'month' | 'week' = 'month'
) {
  const navigate = useCallback((delta: number, unit: 'year' | 'month' | 'week') => {
    setDate(d => {
      const newDate = new Date(d);
      if (unit === 'year') newDate.setFullYear(newDate.getFullYear() + delta);
      else if (unit === 'month') newDate.setMonth(newDate.getMonth() + delta);
      else newDate.setDate(newDate.getDate() + delta * 7);
      return newDate;
    });
  }, [setDate]);

  const handlers = {
    navigateLeft: () => navigate(-1, mode === 'month' ? 'month' : 'week'),
    navigateRight: () => navigate(1, mode === 'month' ? 'month' : 'week'),
    navigateUp: () => navigate(-1, mode === 'month' ? 'year' : 'month'),
    navigateDown: () => navigate(1, mode === 'month' ? 'year' : 'month'),
    navigateToToday: () => setDate(new Date())
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, () => void> = {
        'ArrowLeft': handlers.navigateLeft,
        'ArrowRight': handlers.navigateRight,
        'ArrowUp': handlers.navigateUp,
        'ArrowDown': handlers.navigateDown,
        ' ': handlers.navigateToToday
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        keyMap[e.key]();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, setDate]);

  return handlers;
}