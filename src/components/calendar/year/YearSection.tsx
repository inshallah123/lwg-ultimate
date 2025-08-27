import React from 'react';
import {MonthCard} from './MonthCard';
import {MONTH_NAMES} from '../constants/yearview';
import styles from './YearSection.module.css';

interface YearSectionProps {
  year: number;
  currentYear: number;
  todayYear: number;
  todayMonth: number;
  top: number;
  height: number;
  isScrolling: boolean;
  onMonthClick: (year: number, month: number) => void;
}

export const YearSection: React.FC<YearSectionProps> = ({
  year,
  currentYear,
  todayYear,
  todayMonth,
  top,
  height,
  isScrolling,
  onMonthClick
}) => {
  const isCurrentYear = year === currentYear;
  const isTodayYear = year === todayYear;

  return (
    <div
      className={`${styles.yearSection} ${isCurrentYear ? styles.currentYear : ''} ${isScrolling ? styles.scrolling : ''}`}
      style={{
        top: `${top}px`,
        height: `${height}px`
      }}
      data-year={year}
    >
      <div className={styles.monthsGrid}>
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const isCurrentMonth = isTodayYear && monthIndex === todayMonth;
            return (
            <MonthCard
              key={monthIndex}
              year={year}
              monthIndex={monthIndex}
              monthName={monthName}
              isCurrentMonth={isCurrentMonth}
              isToday={isCurrentMonth}
              onClick={onMonthClick}
            />
          );
        })}
      </div>
    </div>
  );
};