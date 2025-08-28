import React, { useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '@/components/Sidebar/store';
import { TIME_SLOTS } from '@/utils/dateHelpers';
import styles from './WeekEventIndicator.module.css';

interface WeekEventIndicatorProps {
  date: Date;
  hourIndex: number;
}

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
    const tagClass = event.tag || 'custom';
    return (
      <div className={styles.weekEventContainer}>
        <div
          className={`${styles.eventCard} ${styles[tagClass]}`}
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
                      events[0].tag ||
                      'custom';
    
    return (
      <div className={styles.weekEventContainer}>
        <div
          className={`${styles.eventSummaryCard} ${styles[primaryTag]}`}
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
                    className={`${styles.tagDot} ${styles[e.tag || 'custom']}`}
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