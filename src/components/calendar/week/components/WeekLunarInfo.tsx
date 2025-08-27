import React from 'react';
import { getLunarDateInfo } from '@/utils/lunarDate';
import styles from '../WeekView.module.css';

interface WeekLunarInfoProps {
  date: Date;
}

export function WeekLunarInfo({ date }: WeekLunarInfoProps) {
  const lunarInfo = getLunarDateInfo(date);
  
  // 构建显示内容数组
  const displayItems: string[] = [];
  
  // 优先级：节假日 > 节气 > 农历
  if (lunarInfo.festival) {
    displayItems.push(lunarInfo.festival);
  }
  if (lunarInfo.solarTerm) {
    displayItems.push(lunarInfo.solarTerm);
  }
  if (!lunarInfo.festival && !lunarInfo.solarTerm && lunarInfo.lunar) {
    displayItems.push(lunarInfo.lunar);
  }
  if (lunarInfo.workday) {
    displayItems.push(lunarInfo.workday);
  }
  
  // 使用·分隔符连接所有内容
  const displayText = displayItems.join(' · ');
  
  // 决定主要样式类
  const primaryClass = lunarInfo.festival ? styles.festival : 
                       lunarInfo.solarTerm ? styles.solarTerm : 
                       styles.lunar;
  
  return (
    <div className={styles.lunarInfo}>
      {displayText && (
        <span className={primaryClass}>{displayText}</span>
      )}
    </div>
  );
}