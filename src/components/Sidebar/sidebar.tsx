import React from 'react';
import { useSidebarStore } from './store';
import { EventForm } from './components/Eventform';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const isOpen = useSidebarStore(state => state.isOpen);
  const selectedDate = useSidebarStore(state => state.selectedDate);
  const selectedHour = useSidebarStore(state => state.selectedHour);
  const close = useSidebarStore(state => state.close);
  
  const isEventFormOpen = useSidebarStore(state => state.isEventFormOpen);
  const openEventForm = useSidebarStore(state => state.openEventForm);
  const closeEventForm = useSidebarStore(state => state.closeEventForm);
  
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTimeRange = (hourIndex: number) => {
    // hourIndex是时间段索引，每个索引代表2小时，从8点开始
    const startHour = (8 + hourIndex * 2) % 24;
    const endHour = (startHour + 2) % 24;
    
    // 使用24小时制格式，与周视图保持一致
    const formatHour = (h: number) => {
      return `${h.toString().padStart(2, '0')}:00`;
    };
    
    return `${formatHour(startHour)}-${formatHour(endHour)}`;
  };
  
  return (
    <>
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={close} />
          <div className={styles.sidebar}>
        <div className={styles.backgroundGradient} />
        
        <div className={styles.header}>
          <div className={styles.dateDisplay}>
            <div className={styles.dateLabel}>Selected Date</div>
            <div className={styles.dateValue}>{formatDate(selectedDate)}</div>
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
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>📅</div>
            <div className={styles.placeholderText}>No events for this date</div>
            <div className={styles.placeholderHint}>Double-click to add an event</div>
          </div>
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