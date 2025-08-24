import React from 'react';
import styles from '../MonthView.module.css';
import sharedStyles from '../shared.module.css';

interface MonthHeaderProps {
  monthHeader: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthHeader({ monthHeader, onPrevMonth, onNextMonth }: MonthHeaderProps) {
  return (
    <div className={styles.monthHeaderContainer}>
      <button className={sharedStyles.navButton} onClick={onPrevMonth}>
        ‹
      </button>
      <h2 className={styles.monthHeader}>{monthHeader}</h2>
      <button className={sharedStyles.navButton} onClick={onNextMonth}>
        ›
      </button>
    </div>
  );
}