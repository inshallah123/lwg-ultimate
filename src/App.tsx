import React, { useRef } from 'react';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { SearchBox } from '@/components/search/SearchBox';
import { Sidebar } from './components/Sidebar/sidebar';
import { useSidebarOpen } from './components/Sidebar/hooks/useSidebarOpen';
import { useSidebarStore } from './components/Sidebar/store';
import { useCalendarStore } from './components/calendar/store';
import { useCalendarNavigation } from './components/calendar/hooks/useCalendarNavigation';
import styles from './App.module.css';

function App() {
  // 启用键盘导航
  useCalendarNavigation();
  const viewMode = useCalendarStore(state => state.viewMode);
  const isTransitioning = useCalendarStore(state => state.isTransitioning);
  const transitionDirection = useCalendarStore(state => state.transitionDirection);
  const handleViewChange = useCalendarStore(state => state.handleViewChange);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const handleOpenSideBar = useSidebarOpen();
  const openEventForm = useSidebarStore(state => state.openEventForm);
  
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // 实现搜索功能
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Goose's Calendar</h1>
        <SearchBox onSearch={handleSearch} />
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
            <MonthView onOpenSideBar={handleOpenSideBar} onOpenEventForm={openEventForm} /> : 
            <WeekView onOpenSideBar={handleOpenSideBar} onOpenEventForm={openEventForm} />
          }
        </div>
      </div>
      <Sidebar />
    </div>
  );
}

export default App;