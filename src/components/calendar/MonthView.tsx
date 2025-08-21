import React, { useState } from 'react';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import styles from './MonthView.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const CALENDAR_WEEKS = 6;
const DAYS_PER_WEEK = 7;

interface MonthViewProps {
  onOpenSideBar?: (date: Date) => void;
  onOpenEventForm?: (date: Date) => void;
}

export function MonthView({ onOpenSideBar, onOpenEventForm }: MonthViewProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const { navigateLeft, navigateRight } = useCalendarNavigation(setCurrentDate, 'month');
  
  // 键盘快捷键功能已移除，后续可在calendar模块内部实现
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = React.useMemo(() => {
    const currentDay = new Date(startDate);
    const totalDays = CALENDAR_WEEKS * DAYS_PER_WEEK;
    
    return Array.from({ length: totalDays }, () => {
      const day = new Date(currentDay);
      currentDay.setDate(currentDay.getDate() + 1);
      return day;
    });
  }, [currentYear, currentMonth])
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const handleCellClick = (day: Date) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // 双击：直接打开EventForm
      onOpenEventForm?.(day);
    } else {
      // 单击：延迟执行，等待可能的双击
      clickTimeoutRef.current = setTimeout(() => {
        onOpenSideBar?.(day);
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  return (
    <div className={styles.monthContainer}>
      <div className={styles.monthHeaderContainer}>
        <button className={styles.monthNavButton} onClick={navigateLeft}>
          ‹
        </button>
        <h2 className={styles.monthHeader}>{MONTH_NAMES[currentMonth]} {currentYear}</h2>
        <button className={styles.monthNavButton} onClick={navigateRight}>
          ›
        </button>
      </div>
      <div className={styles.calendarGrid}>
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          return (
            <div 
              key={dayKey} 
              className={`${styles.dayCell} ${
                day.getMonth() === currentMonth ? styles.currentMonth : styles.otherMonth
              } ${isToday(day) ? styles.today : ''}`}
              onClick={() => handleCellClick(day)}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}