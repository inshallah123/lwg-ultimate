import React from 'react';
import styles from './DeleteConfirmModal.module.css';

interface RecurringDeleteModalProps {
  isOpen: boolean;
  eventTitle: string;
  onDeleteSingle: () => void;
  onDeleteFuture: () => void;
  onDeleteAll: () => void;
  onCancel: () => void;
}

export function RecurringDeleteModal({
  isOpen,
  eventTitle,
  onDeleteSingle,
  onDeleteFuture,
  onDeleteAll,
  onCancel
}: RecurringDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Delete Recurring Event</h2>
        <p className={styles.message}>
          How would you like to delete "{eventTitle}"?
        </p>
        
        <div className={styles.recurringOptions}>
          <button 
            className={styles.recurringOption}
            onClick={onDeleteSingle}
          >
            <div className={styles.optionIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>This event only</div>
              <div className={styles.optionDesc}>Delete only this occurrence</div>
            </div>
          </button>
          
          <button 
            className={styles.recurringOption}
            onClick={onDeleteFuture}
          >
            <div className={styles.optionIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12.5 7.5L15 10l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>This and future events</div>
              <div className={styles.optionDesc}>Delete this and all future occurrences</div>
            </div>
          </button>
          
          <button 
            className={styles.recurringOption}
            onClick={onDeleteAll}
          >
            <div className={styles.optionIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform="rotate(45 10 10)"/>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>All events in series</div>
              <div className={styles.optionDesc}>Delete all occurrences of this recurring event</div>
            </div>
          </button>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}