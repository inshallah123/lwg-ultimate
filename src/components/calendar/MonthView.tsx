import React from 'react';
import { useCalendarStore } from './store';
import { useSidebarStore } from '../Sidebar/store';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { isToday, WEEKDAY_NAMES_SHORT } from '@/utils/dateHelpers';
import { EventIndicator } from './EventIndicator';
import styles from './MonthView.module.css';

interface MonthViewProps {
  onOpenSideBar?: (date: Date) => void;
}

export function MonthView({ onOpenSideBar }: MonthViewProps = {}) {
  const currentDate = useCalendarStore(state => state.currentDate);
  const navigateMonth = useCalendarStore(state => state.navigateMonth);
  const getMonthDays = useCalendarStore(state => state.getMonthDays);
  const getMonthHeader = useCalendarStore(state => state.getMonthHeader);
  const openEventForm = useSidebarStore(state => state.openEventForm);
  const days = getMonthDays();
  const currentMonth = currentDate.getMonth();
  
  const handleCellClick = useDoubleClick(
    (day: Date) => onOpenSideBar?.(day),
    (day: Date) => openEventForm(day)
  );

  return (
    <div className={styles.monthContainer}>
      <div className={styles.monthHeaderContainer}>
        <button className={styles.monthNavButton} onClick={() => navigateMonth(-1)}>
          ‹
        </button>
        <h2 className={styles.monthHeader}>{getMonthHeader()}</h2>
        <button className={styles.monthNavButton} onClick={() => navigateMonth(1)}>
          ›
        </button>
      </div>
      <div className={styles.calendarGrid}>
        {WEEKDAY_NAMES_SHORT.map(day => (
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
              <span className={styles.dayNumber}>{day.getDate()}</span>
              <EventIndicator 
                date={day} 
                view="month"
                maxDisplay={3}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}