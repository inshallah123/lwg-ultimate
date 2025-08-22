import React, { useRef } from 'react';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { SearchBox } from '@/components/search/SearchBox';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useSidebarStore } from './components/Sidebar/store';
import { useCalendarStore } from './components/calendar/store';
import { useCalendarNavigation } from './components/calendar/hooks/useCalendarNavigation';
import { Event } from '@/types/event';
import { useEventStore } from '@/stores/eventStore';
import styles from './App.module.css';

function App() {
  // 启用键盘导航
  useCalendarNavigation();
  const viewMode = useCalendarStore(state => state.viewMode);
  const isTransitioning = useCalendarStore(state => state.isTransitioning);
  const transitionDirection = useCalendarStore(state => state.transitionDirection);
  const handleViewChange = useCalendarStore(state => state.handleViewChange);
  const setDate = useCalendarStore(state => state.setDate);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const openSidebar = useSidebarStore(state => state.open);
  
  // 临时调试：检查store中的事件
  const events = useEventStore(state => state.events);
  const getEventsInRange = useEventStore(state => state.getEventsInRange);
  const deleteEvent = useEventStore(state => state.deleteEvent);
  
  const debugStore = () => {
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    console.log('📦 Store Events:', events);
    console.log('🔍 Event details:');
    events.forEach(event => {
      // 检查这些是否是幽灵事件
      const isGhost = ['2431', '421'].includes(event.title);
      console.log({
        id: event.id,
        title: event.title + (isGhost ? ' 👻' : ''),
        date: event.date,
        dateType: typeof event.date,
        isDate: event.date instanceof Date,
        dateString: event.date?.toString(),
        recurrence: event.recurrence,
        parentId: event.parentId,
        excludedDates: event.excludedDates,
        timeSlot: event.timeSlot,
        compareToToday: event.date >= today ? 'future' : 'past'
      });
    });
    console.log('📅 Events in Range:', getEventsInRange(today, oneYearLater));
  };
  
  // 清理幽灵事件（临时函数）
  const cleanupGhostEvents = () => {
    const totalCount = events.length;
    console.log(`⚠️ WARNING: Deleting ALL ${totalCount} events!`);
    
    // 无差别清空所有事件
    events.forEach(event => {
      console.log(`🗑️ Deleting:`, event.title, event.id);
      deleteEvent(event.id);
    });
    
    console.log(`✅ Nuclear cleanup completed! Deleted ${totalCount} events. Store is now empty.`);
  };
  
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // 基础搜索功能（可选）
  };
  
  const handleEventClick = (event: Event, date: Date) => {
    // 设置日历日期
    setDate(date);
    
    // 切换到周视图
    if (viewMode !== 'week') {
      handleViewChange('week');
    }
    
    // 根据时间段计算hour索引
    const timeSlotIndex = [
      '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
      '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
      '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
    ].indexOf(event.timeSlot);
    
    // 打开侧边栏，传入日期和小时
    openSidebar(date, timeSlotIndex !== -1 ? timeSlotIndex : undefined);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Goose's Calendar</h1>
        <SearchBox 
          onSearch={handleSearch}
          onEventClick={handleEventClick}
        />
        <button onClick={debugStore} style={{padding: '5px 10px', marginLeft: '10px'}}>
          Debug Store
        </button>
        <button onClick={cleanupGhostEvents} style={{padding: '5px 10px', marginLeft: '5px', backgroundColor: '#ff0000', color: 'white', fontWeight: 'bold'}}>
          🔥 CLEAR ALL
        </button>
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewButton} ${viewMode === 'month' ? styles.active : ''}`}
            onClick={() => handleViewChange('month')}
          >
            Month
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'week' ? styles.active : ''}`}
            onClick={() => handleViewChange('week')}
          >
            Week
          </button>
        </div>
      </div>
      <div className={styles.viewWrapper}>
        <div 
          ref={viewContainerRef}
          className={`${styles.viewContainer} ${isTransitioning ? styles.transitioning : ''} ${styles[transitionDirection]}`}
          data-view={viewMode}
        >
          {viewMode === 'month' ? 
            <MonthView onOpenSideBar={openSidebar} /> : 
            <WeekView onOpenSideBar={openSidebar} />
          }
        </div>
      </div>
      <Sidebar />
    </div>
  );
}

export default App;