import React from 'react';
import styles from './MonthCard.module.css';

interface MonthCardProps {
  year: number;
  monthIndex: number;
  monthName: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: (year: number, month: number) => void;
}

export const MonthCard: React.FC<MonthCardProps> = ({
  year,
  monthIndex,
  monthName,
  isCurrentMonth,
  isToday,
  onClick
}) => {
  return (
    <div
      className={`
        ${styles.monthCard} 
        ${isCurrentMonth ? styles.currentMonth : ''}
        ${isToday ? styles.todayMonth : ''}
      `}
      onClick={() => onClick(year, monthIndex)}
    >
      <div className={styles.monthNumber}>{monthIndex + 1}</div>
      <div className={styles.monthName}>{monthName}</div>
      {isToday && <div className={styles.todayIndicator} />}
    </div>
  );
};