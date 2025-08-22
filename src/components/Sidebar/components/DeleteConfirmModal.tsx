import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  // 重复事件相关
  isRecurring?: boolean;
  onDeleteSingle?: () => void;
  onDeleteFuture?: () => void;
}

export function DeleteConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  isRecurring = false,
  onDeleteSingle,
  onDeleteFuture
}: DeleteConfirmModalProps) {
  
  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);
  
  if (!isOpen) return null;
  
  const modalContent = (
    <>
      <div className={styles.overlay} onClick={onCancel} />
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 9v4m0 4h.01M5.07 19a10 10 0 1113.86 0" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>
        
        {isRecurring ? (
          <>
            <div className={styles.recurringOptions}>
              <button 
                className={styles.recurringOption}
                onClick={onDeleteSingle}
              >
                <div className={styles.optionIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="10" cy="10" r="2" fill="currentColor"/>
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
                    <path d="M10 10l5 0M12.5 7.5L15 10l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>This and future events</div>
                  <div className={styles.optionDesc}>Delete this and all future occurrences</div>
                </div>
              </button>
              
              <button 
                className={styles.recurringOption}
                onClick={onConfirm}
              >
                <div className={styles.optionIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>All events in series</div>
                  <div className={styles.optionDesc}>Delete all occurrences of this recurring event</div>
                </div>
              </button>
            </div>
            
            <div className={styles.actions}>
              <button 
                className={styles.cancelButton}
                onClick={onCancel}
                style={{ width: '100%' }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className={styles.actions}>
            <button 
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className={styles.confirmButton}
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
  
  return createPortal(modalContent, document.body);
}