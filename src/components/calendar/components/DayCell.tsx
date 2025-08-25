import React from 'react';
import { isToday } from '@/utils/dateHelpers';
import { MonthEventIndicator } from '../MonthEventIndicator';
import styles from '../month/MonthView.module.css';

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isScrolling: boolean;
  isDefaultView: boolean;
  row: number;
  scrollPosition: number;
  rowHeight: number;
  containerHeight: number;
  onClick: (day: Date) => void;
  style: React.CSSProperties;
}

export const DayCell = React.memo(function DayCell({ 
  day, 
  isCurrentMonth,
  isScrolling,
  isDefaultView,
  row,
  scrollPosition,
  rowHeight,
  containerHeight,
  onClick,
  style
}: DayCellProps) {
  // 根据滚动状态决定样式
  let useCurrentStyle: boolean;
  
  if (isDefaultView && !isScrolling) {
    // 默认视图（按空格后）：固定显示6行，第1行和第6行涂灰，第2-5行正常
    // 计算单元格在视口中的相对位置
    const cellTop = row * rowHeight - scrollPosition;
    const relativeRow = Math.floor(cellTop / rowHeight);
    // 第1行（索引0）和第6行（索引5）涂灰
    useCurrentStyle = relativeRow >= 1 && relativeRow <= 4; // 第2-5行为正常样式
  } else if (isScrolling) {
    // 滚动时：滑动窗口效果，视口中心的6行用当月样式
    const cellTop = row * rowHeight - scrollPosition;
    const cellBottom = cellTop + rowHeight;
    // 如果单元格在视口内（0到containerHeight之间）
    if (cellTop < containerHeight && cellBottom > 0) {
      // 计算单元格在视口中的行位置
      const visibleRow = Math.floor(cellTop / rowHeight);
      // 中间4行使用当月样式
      useCurrentStyle = visibleRow >= 1 && visibleRow <= 4;
    } else {
      useCurrentStyle = false;
    }
  } else {
    // 静止时：只有当前月份用当月样式
    useCurrentStyle = isCurrentMonth;
  }
  
  return (
    <div
      className={`${styles.dayCell} ${
        useCurrentStyle ? styles.currentMonth : styles.otherMonth
      } ${isToday(day) ? styles.today : ''}`}
      style={style}
      onClick={() => onClick(day)}
    >
      <MonthEventIndicator 
        date={day}
        isCurrentMonth={useCurrentStyle}
        dayNumber={day.getDate()}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // 比较关键属性，减少不必要的重渲染
  return prevProps.day.getTime() === nextProps.day.getTime() &&
         prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
         prevProps.isScrolling === nextProps.isScrolling &&
         prevProps.isDefaultView === nextProps.isDefaultView &&
         prevProps.row === nextProps.row &&
         Math.abs(prevProps.scrollPosition - nextProps.scrollPosition) < 1 && // 允许微小差异
         prevProps.style.top === nextProps.style.top &&
         prevProps.style.left === nextProps.style.left;
});