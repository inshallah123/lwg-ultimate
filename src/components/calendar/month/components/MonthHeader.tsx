import React from 'react';
import styles from '../MonthView.module.css';
import { NavButton } from '../../shared';

interface MonthHeaderProps {
  monthHeader: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthHeader({ monthHeader, onPrevMonth, onNextMonth }: MonthHeaderProps) {
  return (
    <div className={styles.monthHeaderContainer}>
      <NavButton onClick={onPrevMonth} ariaLabel="Previous month">
        ‹
      </NavButton>
      <h2 className={styles.monthHeader}>{monthHeader}</h2>
      <NavButton onClick={onNextMonth} ariaLabel="Next month">
        ›
      </NavButton>
    </div>
  );
}