import React, { useState, useRef } from 'react';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { SearchBox } from '@/components/search/SearchBox';
import styles from './App.module.css';

type ViewMode = 'month' | 'week';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  const viewContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // 实现搜索功能
  };

  const handleViewChange = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    
    setTransitionDirection(newMode === 'week' ? 'right' : 'left');
    setIsTransitioning(true);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        setViewMode(newMode);
        requestAnimationFrame(() => {
          setIsTransitioning(false);
        });
      }, 250);
    });
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
          {viewMode === 'month' ? <MonthView /> : <WeekView />}
        </div>
      </div>
    </div>
  );
}

export default App;