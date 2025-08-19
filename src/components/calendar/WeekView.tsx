import React, { useState } from 'react';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './WeekView.module.css';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;


export function WeekView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { 
    navigateToPreviousWeek, 
    navigateToNextWeek,
    navigateLeft,
    navigateRight,
    navigateUp,
    navigateDown,
    navigateToToday
  } = useCalendarNavigation(setCurrentDate, 'week');
  
  useKeyboardShortcuts([
    { key: 'ArrowLeft', handler: navigateLeft },
    { key: 'ArrowRight', handler: navigateRight },
    { key: 'ArrowUp', handler: navigateUp },
    { key: 'ArrowDown', handler: navigateDown },
    { key: ' ', handler: navigateToToday }
  ]);
  
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };
  
  const weekStart = getWeekStart(currentDate);
  const weekDays = React.useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart.getTime()]);
  
  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
  };
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const timeSlots = React.useMemo(() => {
    const slots = [];
    // 每2小时一个时间段，覆盖完整的24小时
    for (let hour = 0; hour < 24; hour += 2) {
      const startHour = hour;
      const endHour = hour + 2;
      
      // 使用24小时制格式
      const formatHour = (h: number) => {
        return `${h.toString().padStart(2, '0')}:00`;
      };
      
      slots.push(`${formatHour(startHour)}-${formatHour(endHour)}`);
    }
    return slots;
  }, []);

  return (
    <div className={styles.weekContainer}>
      <div className={styles.weekHeaderContainer}>
        <button className={styles.weekNavButton} onClick={navigateToPreviousWeek}>
          ‹
        </button>
        <h2 className={styles.weekHeader}>{formatWeekRange()}</h2>
        <button className={styles.weekNavButton} onClick={navigateToNextWeek}>
          ›
        </button>
      </div>
      
      <div className={styles.weekGrid}>
        <div className={styles.timeColumn}>
          <div className={styles.cornerCell}></div>
          {timeSlots.map((time, index) => (
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
            {timeSlots.map((_, hourIndex) => (
              <div 
                key={`${dayIndex}-${hourIndex}`} 
                className={styles.hourCell}
              >
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}