import React, { useRef } from 'react';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { SearchBox } from '@/components/search/SearchBox';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useSidebarOpen } from './components/Sidebar/hooks/useSidebarOpen';
import { useStore } from './store';
import styles from './App.module.css';

function App() {
  const viewMode = useStore(state => state.viewMode);
  const isTransitioning = useStore(state => state.isTransitioning);
  const transitionDirection = useStore(state => state.transitionDirection);
  const handleViewChange = useStore(state => state.handleViewChange);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const handleOpenSideBar = useSidebarOpen();
  
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
            <MonthView onOpenSideBar={handleOpenSideBar} /> : 
            <WeekView onOpenSideBar={handleOpenSideBar} />
          }
        </div>
      </div>
      <Sidebar />
    </div>
  );
}

export default App;