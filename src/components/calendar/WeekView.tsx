import React from 'react';
import { useCalendarStore } from './store';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { isToday, WEEKDAY_NAMES, TIME_SLOTS } from '@/utils/dateHelpers';
import styles from './WeekView.module.css';


interface WeekViewProps {
  onOpenSideBar?: (date: Date, hour: number) => void;
  onOpenEventForm?: (date: Date, hour: number) => void;
}

export function WeekView({ onOpenSideBar, onOpenEventForm }: WeekViewProps = {}) {
  const navigateWeek = useCalendarStore(state => state.navigateWeek);
  const getWeekDays = useCalendarStore(state => state.getWeekDays);
  const getWeekHeader = useCalendarStore(state => state.getWeekHeader);
  
  const weekDays = getWeekDays();
  
  const handleCellClick = useDoubleClick(
    (day: Date, hourIndex: number) => onOpenSideBar?.(day, hourIndex),
    (day: Date, hourIndex: number) => onOpenEventForm?.(day, hourIndex)
  );

  return (
    <div className={styles.weekContainer}>
      <div className={styles.weekHeaderContainer}>
        <button className={styles.weekNavButton} onClick={() => navigateWeek(-1)}>
          ‹
        </button>
        <h2 className={styles.weekHeader}>{getWeekHeader()}</h2>
        <button className={styles.weekNavButton} onClick={() => navigateWeek(1)}>
          ›
        </button>
      </div>
      
      <div className={styles.weekGrid}>
        <div className={styles.timeColumn}>
          <div className={styles.cornerCell}></div>
          {TIME_SLOTS.map((time, index) => (
            <div key={index} className={styles.timeSlot}>
              {time}
            </div>
          ))}
        </div>
        
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className={styles.dayColumn}>
            <div className={`${styles.dayHeader} ${isToday(day) ? styles.today : ''}`}>
              <div className={styles.dayName}>{WEEKDAY_NAMES[day.getDay()]}</div>
              <div className={styles.dayDate}>{day.getDate()}</div>
            </div>
            {TIME_SLOTS.map((_, hourIndex) => (
              <div 
                key={`${dayIndex}-${hourIndex}`} 
                className={styles.hourCell}
                onClick={() => handleCellClick(day, hourIndex)}
              >
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}