import React, { useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '@/components/Sidebar/store';
import styles from './EventIndicator.module.css';

interface EventIndicatorProps {
  date: Date;
  hourIndex?: number; // 用于周视图
  maxDisplay?: number; // 最多显示几个事件
  view?: 'month' | 'week';
}

// Tag 颜色映射 - 更柔和的配色
const TAG_COLORS: Record<string, string> = {
  private: '#ec4899',  // 玫瑰粉
  work: '#6366f1',     // 靛蓝
  balance: '#10b981',  // 翡翠绿
  custom: '#8b5cf6'    // 紫色
};

// 淡色背景映射（用于周视图）
const TAG_BG_COLORS: Record<string, string> = {
  private: 'rgba(236, 72, 153, 0.08)',
  work: 'rgba(99, 102, 241, 0.08)',
  balance: 'rgba(16, 185, 129, 0.08)',
  custom: 'rgba(139, 92, 246, 0.08)'
};

// 时间段列表 - 与 WeekView 保持一致
const TIME_SLOTS = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
  '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
];

export function EventIndicator({ 
  date, 
  hourIndex, 
  maxDisplay = 3,
  view = 'month' 
}: EventIndicatorProps) {
  // 订阅 events 数组以触发重新渲染
  const allEvents = useEventStore(state => state.events);
  const getEventsInRange = useEventStore(state => state.getEventsInRange);
  const openSidebar = useSidebarStore(state => state.open);
  
  // 获取该日期/时间段的事件
  const events = useMemo(() => {
    // 设置日期范围
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // 获取当天所有事件
    let dayEvents = getEventsInRange(startOfDay, endOfDay);
    
    // 如果是周视图，进一步按时间段过滤
    if (view === 'week' && hourIndex !== undefined && hourIndex >= 0 && hourIndex < TIME_SLOTS.length) {
      const targetTimeSlot = TIME_SLOTS[hourIndex];
      dayEvents = dayEvents.filter(event => event.timeSlot === targetTimeSlot);
    }
    
    return dayEvents;
  }, [date, hourIndex, view, getEventsInRange, allEvents]);
  
  if (events.length === 0) return null;
  
  // 月视图：显示小圆点或数字
  if (view === 'month') {
    return (
      <div className={styles.monthIndicator}>
        {events.slice(0, maxDisplay).map((event, index) => (
          <span
            key={`${event.id}-${index}`}
            className={styles.dot}
            style={{ backgroundColor: TAG_COLORS[event.tag] || TAG_COLORS.custom }}
            title={event.title}
          />
        ))}
        {events.length > maxDisplay && (
          <span className={styles.more}>+{events.length - maxDisplay}</span>
        )}
      </div>
    );
  }
  
  // 周视图：显示单个紧凑卡片
  if (view === 'week') {
    // 只显示第一个事件，如果有多个则显示数量
    const firstEvent = events[0];
    const hasMore = events.length > 1;
    
    // 截断标题，保持简洁
    const truncateTitle = (title: string, maxLength: number = 8) => {
      if (title.length <= maxLength) return title;
      return title.substring(0, maxLength) + '...';
    };
    
    const handleChipClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止冒泡到hourCell
      // 打开侧边栏显示事件列表
      openSidebar(date, hourIndex);
    };
    
    return (
      <div className={styles.weekCompact}>
        <div
          className={styles.compactChip}
          style={{ 
            backgroundColor: TAG_BG_COLORS[firstEvent.tag] || TAG_BG_COLORS.custom,
            borderColor: TAG_COLORS[firstEvent.tag] || TAG_COLORS.custom
          }}
          title={`${firstEvent.title}${hasMore ? ` (+${events.length - 1} more)` : ''}${firstEvent.description ? `\n${firstEvent.description}` : ''}`}
          onClick={handleChipClick}
        >
          <span 
            className={styles.compactDot}
            style={{ backgroundColor: TAG_COLORS[firstEvent.tag] || TAG_COLORS.custom }}
          />
          <span className={styles.compactTitle}>
            {truncateTitle(firstEvent.title)}
          </span>
          {hasMore && (
            <span className={styles.compactCount}>+{events.length - 1}</span>
          )}
        </div>
      </div>
    );
  }
  
  // 原有的返回逻辑（用于其他视图）
  return null;
}