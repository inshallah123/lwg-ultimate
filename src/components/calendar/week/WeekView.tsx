import React, { useEffect } from 'react';
import { useCalendarStore } from '../store';
import { useSidebarStore } from '../../Sidebar/store';
import { useDoubleClick } from '@/hooks/useDoubleClick';
import { isToday, WEEKDAY_NAMES, TIME_SLOTS } from '@/utils/dateHelpers';
import { WeekEventIndicator } from '../WeekEventIndicator';
import { LunarInfo } from '../components/LunarInfo';
import styles from './WeekView.module.css';
import sharedStyles from '../shared.module.css';


interface WeekViewProps {
  onOpenSideBar?: (date: Date, hour: number) => void;
}

export function WeekView({ onOpenSideBar }: WeekViewProps = {}) {
  // 订阅 currentDate 以确保日期变化时重新渲染
  useCalendarStore(state => state.currentDate);
  
  const navigateWeek = useCalendarStore(state => state.navigateWeek);
  const goToToday = useCalendarStore(state => state.goToToday);
  const getWeekDays = useCalendarStore(state => state.getWeekDays);
  const getWeekHeader = useCalendarStore(state => state.getWeekHeader);
  const openEventForm = useSidebarStore(state => state.openEventForm);
  
  const weekDays = getWeekDays();
  
  // 添加空格键监听
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果用户正在输入，不处理快捷键
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        goToToday();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToToday]);
  
  const handleCellClick = useDoubleClick(
    (day: Date, hourIndex: number) => onOpenSideBar?.(day, hourIndex),
    (day: Date, hourIndex: number) => openEventForm(day, hourIndex)
  );

  return (
    <div className={styles.weekContainer}>
      <div className={styles.weekHeaderContainer}>
        <button className={sharedStyles.navButton} onClick={() => navigateWeek(-1)}>
          ‹
        </button>
        <h2 className={styles.weekHeader}>{getWeekHeader()}</h2>
        <button className={sharedStyles.navButton} onClick={() => navigateWeek(1)}>
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
        
        {weekDays.map((day, dayIndex) => {
          return (
            <div key={dayIndex} className={styles.dayColumn}>
              <div className={`${styles.dayHeader} ${isToday(day) ? styles.today : ''}`}>
                <div className={styles.dayName}>{WEEKDAY_NAMES[day.getDay()]}</div>
                <div className={styles.dayDate}>{day.getDate()}</div>
                <LunarInfo date={day} />
              </div>
            {TIME_SLOTS.map((_, hourIndex) => (
              <div 
                key={`${dayIndex}-${hourIndex}`} 
                className={styles.hourCell}
                onClick={() => handleCellClick(day, hourIndex)}
              >
                <WeekEventIndicator 
                  date={day} 
                  hourIndex={hourIndex}
                />
              </div>
            ))}
          </div>
          );
        })}
      </div>
    </div>
  );
}