import React, { useCallback } from 'react';

type ViewMode = 'month' | 'week';

export function useCalendarNavigation(
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>,
  viewMode: ViewMode = 'month'
) {
  const navigateToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, [setCurrentDate]);

  const navigateToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, [setCurrentDate]);

  const navigateToPreviousYear = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  }, [setCurrentDate]);

  const navigateToNextYear = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  }, [setCurrentDate]);

  const navigateToPreviousWeek = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, [setCurrentDate]);

  const navigateToNextWeek = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, [setCurrentDate]);

  const navigateLeft = useCallback(() => {
    if (viewMode === 'month') {
      navigateToPreviousMonth();
    } else {
      navigateToPreviousWeek();
    }
  }, [viewMode, navigateToPreviousMonth, navigateToPreviousWeek]);

  const navigateRight = useCallback(() => {
    if (viewMode === 'month') {
      navigateToNextMonth();
    } else {
      navigateToNextWeek();
    }
  }, [viewMode, navigateToNextMonth, navigateToNextWeek]);

  const navigateUp = useCallback(() => {
    if (viewMode === 'month') {
      navigateToPreviousYear();
    } else {
      navigateToPreviousMonth();
    }
  }, [viewMode, navigateToPreviousYear, navigateToPreviousMonth]);

  const navigateDown = useCallback(() => {
    if (viewMode === 'month') {
      navigateToNextYear();
    } else {
      navigateToNextMonth();
    }
  }, [viewMode, navigateToNextYear, navigateToNextMonth]);

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  return {
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToPreviousYear,
    navigateToNextYear,
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateLeft,
    navigateRight,
    navigateUp,
    navigateDown,
    navigateToToday
  };
}