import React, { useState } from 'react';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import styles from './WeekView.module.css';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;


interface WeekViewProps {
  onOpenSideBar?: (date: Date, hour: number) => void;
  onOpenEventForm?: (date: Date, hour: number) => void;
}

export function WeekView({ onOpenSideBar, onOpenEventForm }: WeekViewProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { navigateLeft, navigateRight } = useCalendarNavigation(setCurrentDate, 'week');

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
      // 同月份：17-23, Aug, 2025
      return `${start.getDate()}-${end.getDate()}, ${monthNames[start.getMonth()]}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      // 跨月份同年：28-4, Jul-Aug, 2025
      return `${start.getDate()}-${end.getDate()}, ${monthNames[start.getMonth()]}-${monthNames[end.getMonth()]}, ${start.getFullYear()}`;
    } else {
      // 跨年：28-3, Dec-Jan, 2024-2025
      return `${start.getDate()}-${end.getDate()}, ${monthNames[start.getMonth()]}-${monthNames[end.getMonth()]}, ${start.getFullYear()}-${end.getFullYear()}`;
    }
  };
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const timeSlots = React.useMemo(() => {
    const slots = [];
    // 从8点开始，每2小时一个时间段，覆盖24小时
    for (let i = 0; i < 12; i++) {
      const startHour = (8 + i * 2) % 24;
      const endHour = (startHour + 2) % 24;
      
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
        <button className={styles.weekNavButton} onClick={navigateLeft}>
          ‹
        </button>
        <h2 className={styles.weekHeader}>{formatWeekRange()}</h2>
        <button className={styles.weekNavButton} onClick={navigateRight}>
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
                onClick={() => onOpenSideBar?.(day, hourIndex)}
                onDoubleClick={() => onOpenEventForm?.(day, hourIndex)}
              >
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}