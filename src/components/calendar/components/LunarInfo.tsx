import React from 'react';
import { getLunarDateInfo } from '@/utils/lunarDate';
import styles from '../MonthView.module.css';

interface LunarInfoProps {
  date: Date;
}

export function LunarInfo({ date }: LunarInfoProps) {
  const lunarInfo = getLunarDateInfo(date);
  
  return (
    <div className={styles.lunarInfo}>
      {lunarInfo.festival && (
        <span className={styles.festival}>{lunarInfo.festival}</span>
      )}
      {!lunarInfo.festival && lunarInfo.solarTerm && (
        <span className={styles.solarTerm}>{lunarInfo.solarTerm}</span>
      )}
      {!lunarInfo.festival && !lunarInfo.solarTerm && lunarInfo.lunar && (
        <span className={styles.lunar}>{lunarInfo.lunar}</span>
      )}
      {lunarInfo.workday && (
        <span className={styles.workday}>{lunarInfo.workday}</span>
      )}
    </div>
  );
}