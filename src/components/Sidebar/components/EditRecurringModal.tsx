import React from 'react';
import styles from './DeleteConfirmModal.module.css';

interface EditRecurringModalProps {
  isOpen: boolean;
  eventTitle: string;
  isChangingRecurrence: boolean;
  onEditSingle: () => void;
  onEditFuture: () => void;
  onEditAll: () => void;
  onCancel: () => void;
}

export function EditRecurringModal({
  isOpen,
  eventTitle,
  isChangingRecurrence,
  onEditSingle,
  onEditFuture,
  onEditAll,
  onCancel
}: EditRecurringModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Edit Recurring Event</h2>
        <p className={styles.message}>
          {isChangingRecurrence 
            ? `Changing the recurrence pattern will create a new series and replace the existing one.`
            : `How would you like to edit "${eventTitle}"?`
          }
        </p>
        
        <div className={styles.recurringOptions}>
          {!isChangingRecurrence && (
            <button 
              className={styles.recurringOption}
              onClick={onEditSingle}
            >
              <div className={styles.optionIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={styles.optionContent}>
                <div className={styles.optionTitle}>This event only</div>
                <div className={styles.optionDesc}>Edit only this occurrence</div>
              </div>
            </button>
          )}
          
          {!isChangingRecurrence && (
            <button 
              className={styles.recurringOption}
              onClick={onEditFuture}
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
                <div className={styles.optionDesc}>Edit this and all future occurrences</div>
              </div>
            </button>
          )}
          
          <button 
            className={styles.recurringOption}
            onClick={onEditAll}
          >
            <div className={styles.optionIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="2" fill="currentColor"/>
                <path d="M10 4v2M10 14v2M4 10h2M14 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>
                {isChangingRecurrence ? 'I understand' : 'All events in series'}
              </div>
              <div className={styles.optionDesc}>
                {isChangingRecurrence 
                  ? 'Continue with creating a new recurring series'
                  : 'Edit all occurrences of this recurring event'
                }
              </div>
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