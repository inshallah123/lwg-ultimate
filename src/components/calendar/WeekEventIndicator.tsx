import React, { useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '@/components/Sidebar/store';
import styles from './WeekEventIndicator.module.css';

interface WeekEventIndicatorProps {
  date: Date;
  hourIndex: number;
}

// 优化的颜色系统 - 遵循 WCAG AA 标准
const TAG_COLORS: Record<string, string> = {
  private: '#e11d48',  // 玫瑰红 - 更高对比度
  work: '#4f46e5',     // 靛蓝 - 更深色调
  balance: '#059669',  // 翡翠绿 - 更饱和
  custom: '#7c3aed'    // 紫色 - 更鲜明
};

// 渐变背景映射（用于周视图）- 增强视觉层次
const TAG_BG_COLORS: Record<string, string> = {
  private: 'linear-gradient(135deg, rgba(225, 29, 72, 0.06), rgba(225, 29, 72, 0.02))',
  work: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(79, 70, 229, 0.02))',
  balance: 'linear-gradient(135deg, rgba(5, 150, 105, 0.06), rgba(5, 150, 105, 0.02))',
  custom: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(124, 58, 237, 0.02))'
};

// 边框颜色映射 - 用于增强轮廓
const TAG_BORDER_COLORS: Record<string, string> = {
  private: 'rgba(225, 29, 72, 0.2)',
  work: 'rgba(79, 70, 229, 0.2)',
  balance: 'rgba(5, 150, 105, 0.2)',
  custom: 'rgba(124, 58, 237, 0.2)'
};

// 时间段列表 - 与 WeekView 保持一致
const TIME_SLOTS = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
  '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
];

export function WeekEventIndicator({ date, hourIndex }: WeekEventIndicatorProps) {
  // 订阅 events 数组以触发重新渲染
  const allEvents = useEventStore(state => state.events);
  const getEventsInRange = useEventStore(state => state.getEventsInRange);
  const openSidebar = useSidebarStore(state => state.open);
  
  // 获取该时间段的事件
  const events = useMemo(() => {
    // 设置日期范围
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // 获取当天所有事件
    let dayEvents = getEventsInRange(startOfDay, endOfDay);
    
    // 按时间段过滤
    if (hourIndex >= 0 && hourIndex < TIME_SLOTS.length) {
      const targetTimeSlot = TIME_SLOTS[hourIndex];
      dayEvents = dayEvents.filter(event => event.timeSlot === targetTimeSlot);
    }
    
    return dayEvents;
  }, [date, hourIndex, getEventsInRange, allEvents]);
  
  if (events.length === 0) return null;
  
  // 动态计算标题长度
  const truncateTitle = (title: string, maxChars: number = 12) => {
    if (title.length <= maxChars) return title;
    return title.substring(0, maxChars - 1) + '…';
  };
  
  const handleChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openSidebar(date, hourIndex);
  };
  
  // 生成事件概述信息
  const generateEventSummary = (eventList: typeof events) => {
    if (eventList.length <= 2) {
      return eventList.map(e => truncateTitle(e.title, 8)).join(' / ');
    }
    // 超过2个事件时，显示第一个和最后一个的名称
    const first = truncateTitle(eventList[0].title, 6);
    const last = truncateTitle(eventList[eventList.length - 1].title, 6);
    return `${first} / ... / ${last}`;
  };
  
  // 生成详细的 tooltip 信息
  const generateTooltip = (eventList: typeof events) => {
    return eventList.map((e, i) => 
      `${i + 1}. ${e.title}${e.description ? ` - ${e.description}` : ''}`
    ).join('\n');
  };
  
  // 根据事件数量决定显示策略
  if (events.length === 1) {
    // 单个事件：完整显示
    const event = events[0];
    return (
      <div className={styles.weekEventContainer}>
        <div
          className={styles.eventCard}
          style={{ 
            background: TAG_BG_COLORS[event.tag] || TAG_BG_COLORS.custom,
            borderColor: TAG_BORDER_COLORS[event.tag] || TAG_BORDER_COLORS.custom,
            '--accent-color': TAG_COLORS[event.tag] || TAG_COLORS.custom
          } as React.CSSProperties}
          title={`${event.title}${event.description ? `\n${event.description}` : ''}`}
          onClick={handleChipClick}
          data-tag={event.tag}
        >
          <div className={styles.eventContent}>
            <span className={styles.eventTitle}>
              {truncateTitle(event.title, 16)}
            </span>
            {event.timeSlot && (
              <span className={styles.eventTime}>
                {event.timeSlot.split('-')[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    // 多个事件：显示概述信息
    const summary = generateEventSummary(events);
    const tooltip = generateTooltip(events);
    
    // 选择主要颜色（优先级：work > private > balance > custom）
    const primaryTag = events.find(e => e.tag === 'work')?.tag ||
                      events.find(e => e.tag === 'private')?.tag ||
                      events.find(e => e.tag === 'balance')?.tag ||
                      events[0].tag;
    
    return (
      <div className={styles.weekEventContainer}>
        <div
          className={styles.eventSummaryCard}
          style={{ 
            background: TAG_BG_COLORS[primaryTag] || TAG_BG_COLORS.custom,
            borderColor: TAG_BORDER_COLORS[primaryTag] || TAG_BORDER_COLORS.custom,
            '--accent-color': TAG_COLORS[primaryTag] || TAG_COLORS.custom
          } as React.CSSProperties}
          title={tooltip}
          onClick={handleChipClick}
          data-tag={primaryTag}
        >
          <div className={styles.summaryHeader}>
            <span className={styles.eventCount}>{events.length}个事件</span>
            {events.length <= 3 && (
              <div className={styles.tagDots}>
                {events.map((e, i) => (
                  <span 
                    key={i}
                    className={styles.tagDot}
                    style={{ backgroundColor: TAG_COLORS[e.tag] || TAG_COLORS.custom }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.eventSummary}>
              {summary}
            </span>
          </div>
        </div>
      </div>
    );
  }
}