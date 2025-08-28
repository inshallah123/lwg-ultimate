import React, { useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '@/components/Sidebar/store';
import { getLunarDateInfo } from '@/utils/lunarDate';
import styles from './DayCellContent.module.css';

interface DayCellContentProps {
  date: Date;
  isCurrentMonth?: boolean;
  dayNumber: number;
}

export const DayCellContent = React.memo(function DayCellContent({ 
  date, 
  isCurrentMonth = true, 
  dayNumber 
}: DayCellContentProps) {
  const events = useEventStore(state => state.events);
  const getEventsInRange = useEventStore(state => state.getEventsInRange);
  const openSidebar = useSidebarStore(state => state.open);
  
  // 获取农历信息
  const lunarInfo = getLunarDateInfo(date);
  
  // 构建农历显示内容
  const lunarDisplayItems: string[] = [];
  if (lunarInfo.festival) {
    lunarDisplayItems.push(lunarInfo.festival);
  }
  if (lunarInfo.solarTerm) {
    lunarDisplayItems.push(lunarInfo.solarTerm);
  }
  if (!lunarInfo.festival && !lunarInfo.solarTerm && lunarInfo.lunar) {
    lunarDisplayItems.push(lunarInfo.lunar);
  }
  if (lunarInfo.workday) {
    lunarDisplayItems.push(lunarInfo.workday);
  }
  const lunarDisplayText = lunarDisplayItems.join(' · ');
  
  // 决定农历样式类
  const lunarClass = lunarInfo.festival ? styles.festival : 
                     lunarInfo.solarTerm ? styles.solarTerm : 
                     styles.lunar;
  
  // 获取该日期的事件
  const dayEvents = useMemo(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return getEventsInRange(startOfDay, endOfDay);
  }, [date, getEventsInRange, events]);
  
  // 如果没有事件，只显示日期头部
  if (dayEvents.length === 0) {
    return (
      <>
        <div className={styles.dayCellHeader}>
          <span className={styles.dayNumber}>{dayNumber}</span>
          {lunarDisplayText && (
            <div className={styles.lunarInfo}>
              <span className={lunarClass}>{lunarDisplayText}</span>
            </div>
          )}
        </div>
      </>
    );
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openSidebar(date);
  };
  
  // 截断标题
  const truncateTitle = (title: string, maxChars: number) => {
    if (title.length <= maxChars) return title;
    return title.substring(0, maxChars - 1) + '…';
  };
  
  // 生成详细tooltip
  const generateTooltip = () => {
    return dayEvents.map((e, i) => 
      `${i + 1}. ${e.title}${e.description ? ` - ${e.description}` : ''}`
    ).join('\n');
  };
  
  // 获取主色调
  const getPrimaryTag = () => {
    return dayEvents.find(e => e.tag === 'work')?.tag ||
           dayEvents.find(e => e.tag === 'private')?.tag ||
           dayEvents.find(e => e.tag === 'balance')?.tag ||
           dayEvents[0].tag;
  };
  
  // 根据事件数量和当前月份状态决定显示策略
  let actualMaxDisplay: number | undefined;
  
  if (!isCurrentMonth) {
    // 非当前月：最多显示2个
    actualMaxDisplay = Math.min(2, dayEvents.length);
  } else if (dayEvents.length > 4) {
    // 当前月超过4个事件：始终显示4个 + 指示器
    actualMaxDisplay = 4;
  } else {
    // 4个或更少：全部显示
    actualMaxDisplay = dayEvents.length;
  }
  
  const displayEvents = dayEvents.slice(0, actualMaxDisplay);
  const remainingCount = dayEvents.length - displayEvents.length;
  
  // 对于特别多的事件（超过8个），使用紧凑指示器
  if (dayEvents.length > 8 && !isCurrentMonth) {
    const primaryTag = getPrimaryTag() || 'custom';
    return (
      <div className={styles.cellContent}>
        <div 
          className={`${styles.compactIndicator} ${styles[primaryTag]}`}
          onClick={handleClick}
          title={generateTooltip()}
        >
          <span className={styles.compactCount}>{dayEvents.length}个事件</span>
          <div className={styles.compactDots}>
            {dayEvents.slice(0, Math.min(4, dayEvents.length)).map((e, i) => (
              <span
                key={i}
                className={`${styles.compactDot} ${styles[e.tag || 'custom']}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* 日期头部区域 - 包含日期、农历和更多指示器 */}
      <div className={styles.dayCellHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.dayNumber}>{dayNumber}</span>
          {lunarDisplayText && (
            <div className={styles.lunarInfo}>
              <span className={lunarClass}>{lunarDisplayText}</span>
            </div>
          )}
        </div>
        {/* 更多指示器移到头部右侧 */}
        {remainingCount > 0 && (
          <div 
            className={styles.moreIndicatorCompact}
            onClick={handleClick}
            title={generateTooltip()}
          >
            <span className={styles.moreTextCompact}>
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      
      {/* 事件容器 */}
      <div className={styles.eventContainer}>
        {/* 事件卡片网格 - 双列布局 */}
        {displayEvents.length > 0 && (
          <div className={`${styles.eventGrid} ${displayEvents.length === 1 ? styles.singleEvent : ''}`}>
            {displayEvents.map((event, index) => {
              const tagClass = event.tag || 'custom';
              return (
                <div
                  key={`${event.id}-${index}`}
                  className={`${styles.eventCard} ${styles[tagClass]} ${!isCurrentMonth ? styles.muted : ''}`}
                  onClick={handleClick}
                  title={`${event.title}${event.description ? `\n${event.description}` : ''}`}
                >
                  <span className={`${styles.eventDot} ${styles[tagClass]}`} />
                  <span className={styles.eventTitle}>
                    {truncateTitle(event.title, 
                      displayEvents.length === 1 ? 12 : 
                      isCurrentMonth ? 6 : 5
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在date或isCurrentMonth变化时重新渲染
  return prevProps.date.getTime() === nextProps.date.getTime() && 
         prevProps.isCurrentMonth === nextProps.isCurrentMonth;
});