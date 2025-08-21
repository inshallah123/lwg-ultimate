import React from 'react';
import { EventCard } from './EventCard';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '../store';
import styles from './EventList.module.css';

// 时间段列表 - 与 WeekView 和 EventForm 保持一致
const TIME_SLOTS = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
  '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
];

export function EventList() {
  const selectedDate = useSidebarStore(state => state.selectedDate);
  const selectedHour = useSidebarStore(state => state.selectedHour);
  // 直接订阅 events 数组，然后在组件内过滤
  const allEvents = useEventStore(state => state.events);
  
  // 在组件内进行过滤，避免无限循环
  const events = React.useMemo(() => {
    if (!selectedDate) return [];
    
    // 先按日期过滤
    let filteredEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === selectedDate.getFullYear() &&
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getDate() === selectedDate.getDate();
    });
    
    // 如果有 selectedHour（从周视图点击），进一步按时间段过滤
    if (selectedHour !== null && selectedHour >= 0 && selectedHour < TIME_SLOTS.length) {
      const targetTimeSlot = TIME_SLOTS[selectedHour];
      filteredEvents = filteredEvents.filter(event => event.timeSlot === targetTimeSlot);
    }
    
    return filteredEvents;
  }, [allEvents, selectedDate, selectedHour]);
  
  const handleEditEvent = (event: any) => {
    // TODO: 实现编辑功能
    console.log('Edit event:', event);
  };
  
  if (!selectedDate) {
    return (
      <div className={styles.emptyState}>
        <p>Select a date to view events</p>
      </div>
    );
  }
  
  if (events.length === 0) {
    const emptyMessage = selectedHour !== null 
      ? `No events for this time slot`
      : `No events for this date`;
      
    return (
      <div className={styles.emptyState}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="12" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 6v8M32 6v8M8 20h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="24" cy="30" r="2" fill="currentColor"/>
        </svg>
        <p>{emptyMessage}</p>
        <span>Double-click on calendar to add event</span>
      </div>
    );
  }
  
  // 生成标题 - 根据是否有时间段选择显示不同内容
  const getTitle = () => {
    const dateStr = selectedDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    if (selectedHour !== null && selectedHour >= 0 && selectedHour < TIME_SLOTS.length) {
      return `${dateStr} • ${TIME_SLOTS[selectedHour]}`;
    }
    return dateStr;
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {getTitle()}
        </h3>
        <span className={styles.count}>{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className={styles.list}>
        {events.map(event => (
          <EventCard 
            key={event.id} 
            event={event}
            onEdit={handleEditEvent}
          />
        ))}
      </div>
    </div>
  );
}