import React from 'react';
import { WEEKDAY_NAMES_SHORT } from '@/utils/dateHelpers';
import styles from '../MonthView.module.css';

export function WeekdayHeader() {
  return (
    <div className={styles.weekdayRow}>
      {WEEKDAY_NAMES_SHORT.map(day => (
        <div key={day} className={styles.weekdayHeader}>
          {day}
        </div>
      ))}
    </div>
  );
}