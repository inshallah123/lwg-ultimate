import React, { useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '@/components/Sidebar/store';
import styles from './MonthEventIndicator.module.css';

interface MonthEventIndicatorProps {
  date: Date;
  maxDisplay?: number;
  isCurrentMonth?: boolean;
}

// 优化的颜色系统 - 高对比度
const TAG_COLORS: Record<string, string> = {
  private: '#e11d48',
  work: '#4f46e5',
  balance: '#059669',
  custom: '#7c3aed'
};

// 淡色背景 - 用于卡片
const TAG_BG_COLORS: Record<string, string> = {
  private: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(225, 29, 72, 0.03))',
  work: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(79, 70, 229, 0.03))',
  balance: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(5, 150, 105, 0.03))',
  custom: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(124, 58, 237, 0.03))'
};

// 边框颜色
const TAG_BORDER_COLORS: Record<string, string> = {
  private: 'rgba(225, 29, 72, 0.15)',
  work: 'rgba(79, 70, 229, 0.15)',
  balance: 'rgba(5, 150, 105, 0.15)',
  custom: 'rgba(124, 58, 237, 0.15)'
};

export function MonthEventIndicator({ date, isCurrentMonth = true }: MonthEventIndicatorProps) {
  const allEvents = useEventStore(state => state.events);
  const getEventsInRange = useEventStore(state => state.getEventsInRange);
  const openSidebar = useSidebarStore(state => state.open);
  
  // 获取该日期的事件
  const events = useMemo(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return getEventsInRange(startOfDay, endOfDay);
  }, [date, getEventsInRange, allEvents]);
  
  if (events.length === 0) return null;
  
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
    return events.map((e, i) => 
      `${i + 1}. ${e.title}${e.description ? ` - ${e.description}` : ''}`
    ).join('\n');
  };
  
  // 获取主色调
  const getPrimaryTag = () => {
    return events.find(e => e.tag === 'work')?.tag ||
           events.find(e => e.tag === 'private')?.tag ||
           events.find(e => e.tag === 'balance')?.tag ||
           events[0].tag;
  };
  
  // 根据事件数量和当前月份状态决定显示策略
  // 双列布局：最多显示4个事件（两行，每行两个）
  let actualMaxDisplay: number | undefined;
  
  if (!isCurrentMonth) {
    // 非当前月：最多显示2个
    actualMaxDisplay = Math.min(2, events.length);
  } else if (events.length > 4) {
    // 当前月超过4个事件：始终显示4个 + 指示器
    actualMaxDisplay = 4;
  } else {
    // 4个或更少：全部显示
    actualMaxDisplay = events.length;
  }
  
  const displayEvents = events.slice(0, actualMaxDisplay);
  const remainingCount = events.length - displayEvents.length;
  
  // 对于特别多的事件（超过8个），使用紧凑指示器
  if (events.length > 8 && !isCurrentMonth) {
    const primaryTag = getPrimaryTag();
    return (
      <div className={styles.monthEventContainer}>
        <div 
          className={styles.compactIndicator}
          onClick={handleClick}
          title={generateTooltip()}
          style={{
            background: TAG_BG_COLORS[primaryTag] || TAG_BG_COLORS.custom,
            borderColor: TAG_BORDER_COLORS[primaryTag] || TAG_BORDER_COLORS.custom,
            color: TAG_COLORS[primaryTag] || TAG_COLORS.custom
          } as React.CSSProperties}
        >
          <span className={styles.compactCount}>{events.length}个事件</span>
          <div className={styles.compactDots}>
            {events.slice(0, Math.min(4, events.length)).map((e, i) => (
              <span
                key={i}
                className={styles.compactDot}
                style={{ backgroundColor: TAG_COLORS[e.tag] || TAG_COLORS.custom }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.monthEventContainer}>
      {/* 事件卡片网格 - 双列布局 */}
      {displayEvents.length > 0 && (
        <div className={`${styles.eventGrid} ${displayEvents.length === 1 ? styles.singleEvent : ''}`}>
          {displayEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className={`${styles.eventCard} ${!isCurrentMonth ? styles.muted : ''}`}
              style={{
                background: TAG_BG_COLORS[event.tag] || TAG_BG_COLORS.custom,
                borderColor: TAG_BORDER_COLORS[event.tag] || TAG_BORDER_COLORS.custom,
                '--accent-color': TAG_COLORS[event.tag] || TAG_COLORS.custom,
                opacity: isCurrentMonth ? 1 : 0.7
              } as React.CSSProperties}
              onClick={handleClick}
              title={`${event.title}${event.description ? `\n${event.description}` : ''}`}
            >
              <span className={styles.eventDot} 
                    style={{ backgroundColor: TAG_COLORS[event.tag] || TAG_COLORS.custom }} />
              <span className={styles.eventTitle}>
                {truncateTitle(event.title, 
                  displayEvents.length === 1 ? 12 : 
                  isCurrentMonth ? 6 : 5
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* 更多指示器 - 单独一行 */}
      {remainingCount > 0 && (
        <div 
          className={styles.moreIndicator}
          onClick={handleClick}
          title={generateTooltip()}
        >
          <span className={styles.moreText}>
            {remainingCount === 1 ? `还有1个` : `+${remainingCount}个`}
          </span>
          {remainingCount <= 4 && (
            <div className={styles.moreDots}>
              {events.slice(displayEvents.length, displayEvents.length + Math.min(4, remainingCount)).map((e, i) => (
                <span
                  key={i}
                  className={styles.moreDot}
                  style={{ backgroundColor: TAG_COLORS[e.tag] || TAG_COLORS.custom }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}