import React from 'react';
import { useSidebarStore } from './store';
import { EventForm } from './components/Eventform';
import { EventList } from './components/EventList';
import { formatDate, formatTimeRange } from '@/utils/dateHelpers';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const isOpen = useSidebarStore(state => state.isOpen);
  const selectedDate = useSidebarStore(state => state.selectedDate);
  const selectedHour = useSidebarStore(state => state.selectedHour);
  const close = useSidebarStore(state => state.close);
  
  const isEventFormOpen = useSidebarStore(state => state.isEventFormOpen);
  const openEventForm = useSidebarStore(state => state.openEventForm);
  const closeEventForm = useSidebarStore(state => state.closeEventForm);
  
  
  
  return (
    <>
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={close} />
          <div className={styles.sidebar}>
        
        <div className={styles.header}>
          <div className={styles.dateDisplay}>
            <div className={styles.dateLabel}>Selected Date</div>
            <div className={styles.dateValue}>{formatDate(selectedDate, 'long')}</div>
            {selectedHour !== null && (
              <div className={styles.timeRange}>{formatTimeRange(selectedHour)}</div>
            )}
          </div>
          <button className={styles.closeButton} onClick={close}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.content}>
          <EventList />
        </div>
        
        <div className={styles.footer}>
          <button className={styles.actionButton} onClick={() => openEventForm()}>
            <span className={styles.actionIcon}>+</span>
            Quick Add Event
          </button>
        </div>
      </div>
        </>
      )}
      <EventForm 
        isOpen={isEventFormOpen} 
        onClose={closeEventForm}
      />
    </>
  );
}