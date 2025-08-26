import React from 'react';
import { DayCell } from './components';
import { VIEW_CONFIG } from '../constants/monthview';
import styles from './MonthView.module.css';

interface CalendarRowProps {
  rowIndex: number;
  allDays: Date[];
  startIndex: number;
  endIndex: number;
  currentDate: Date;
  isScrolling: boolean;
  scrollPosition: number;
  rowHeight: number;
  containerHeight: number;
  onCellClick: (day: Date) => void;
}

export const CalendarRow = React.memo<CalendarRowProps>(({
  rowIndex,
  allDays,
  startIndex,
  endIndex,
  currentDate,
  isScrolling,
  scrollPosition,
  rowHeight,
  containerHeight,
  onCellClick
}) => {
  const rowCells = [];
  
  for (let col = 0; col < VIEW_CONFIG.DAYS_PER_WEEK; col++) {
    const dayIndex = rowIndex * VIEW_CONFIG.DAYS_PER_WEEK + col;
    
    if (dayIndex < startIndex || dayIndex >= endIndex || dayIndex >= allDays.length) {
      continue;
    }
    
    const day = allDays[dayIndex];
    if (!day) continue;
    
    const dayKey = day.toISOString().split('T')[0];
    const isCurrentMonth = day.getMonth() === currentDate.getMonth() && 
                          day.getFullYear() === currentDate.getFullYear();
    
    rowCells.push(
      <DayCell
        key={dayKey}
        day={day}
        isCurrentMonth={isCurrentMonth}
        isScrolling={isScrolling}
        isDefaultView={false}
        row={rowIndex}
        scrollPosition={scrollPosition}
        rowHeight={rowHeight}
        containerHeight={containerHeight}
        onClick={onCellClick}
        style={{
          borderTop: rowIndex === 0 ? '1px solid var(--color-border-light)' : 'none'
        }}
      />
    );
  }
  
  if (rowCells.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={`${styles.weekRow} ${isScrolling ? styles.scrolling : ''}`}
      style={{
        height: `${rowHeight}px`,
        top: `${Math.round(rowIndex * rowHeight - scrollPosition)}px`,
      }}
    >
      {rowCells}
    </div>
  );
});

CalendarRow.displayName = 'CalendarRow';