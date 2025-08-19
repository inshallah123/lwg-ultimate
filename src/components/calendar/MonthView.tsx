/**
 * 月视图组件
 * 作用: 显示月度日历视图，展示整月的日期和事件
 * 
 * 信息流:
 *   1. 接收来自App.tsx的props和状态
 *   2. 计算并渲染月度日历网格(6周x7天)
 *   3. 处理用户的日期选择和事件点击
 *   4. 与事件相关组件通信显示事件详情
 * 
 * 与其他文件关系:
 *   - 被 App.tsx 导入和使用
 *   - 可能调用 events/ 下的事件组件
 *   - 未来可能使用 hooks/ 下的日期处理逻辑
 *   - 可能使用 utils/ 下的日期工具函数
 */
import React, { useState } from 'react';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './MonthView.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const CALENDAR_WEEKS = 6;
const DAYS_PER_WEEK = 7;

export function MonthView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const { 
    navigateToPreviousMonth, 
    navigateToNextMonth,
    navigateLeft,
    navigateRight,
    navigateUp,
    navigateDown,
    navigateToToday
  } = useCalendarNavigation(setCurrentDate, 'month');
  
  useKeyboardShortcuts([
    { key: 'ArrowLeft', handler: navigateLeft },
    { key: 'ArrowRight', handler: navigateRight },
    { key: 'ArrowUp', handler: navigateUp },
    { key: 'ArrowDown', handler: navigateDown },
    { key: ' ', handler: navigateToToday }
  ]);
  
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


  return (
    <div className={styles.monthContainer}>
      <div className={styles.monthHeaderContainer}>
        <button className={styles.monthNavButton} onClick={navigateToPreviousMonth}>
          ‹
        </button>
        <h2 className={styles.monthHeader}>{MONTH_NAMES[currentMonth]} {currentYear}</h2>
        <button className={styles.monthNavButton} onClick={navigateToNextMonth}>
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
          >
            {day.getDate()}
          </div>
          );
        })}
      </div>
    </div>
  );
}