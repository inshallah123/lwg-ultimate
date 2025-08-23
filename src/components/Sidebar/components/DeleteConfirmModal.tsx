import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Event } from '@/types/event';
import { DeleteScope } from '@/stores/eventStore/types';
import { 
  getEventType,
  getAvailableScopes,
  getScopeLabel,
  getScopeDescription,
  needsScopeSelection
} from '../logic/eventTypeUtils';
import { getDeleteConfirmMessage } from '../logic/deleteOperations';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  event?: Event;
  onSelectScope: (scope: DeleteScope) => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  event,
  onSelectScope,
  onCancel
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
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);
  
  if (!isOpen || !event) return null;
  
  const eventType = getEventType(event);
  const showScopeSelection = needsScopeSelection(eventType, 'delete');
  const availableScopes = getAvailableScopes(eventType, 'delete');
  const message = getDeleteConfirmMessage(eventType, 'single');
  
  // SE只有删除选项，显示简单确认
  if (!showScopeSelection) {
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
            <h3 className={styles.title}>Delete Event</h3>
            <p className={styles.message}>{message}</p>
          </div>
          
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={() => onSelectScope('single')}>
              Confirm Delete
            </button>
          </div>
        </div>
      </>
    );
    return createPortal(modalContent, document.body);
  }
  
  // 重复事件的删除选项
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
          <h3 className={styles.title}>Delete Recurring Event</h3>
          <p className={styles.message}>How would you like to delete this recurring event?</p>
        </div>
        
        <div className={styles.recurringOptions}>
          {availableScopes.map(scope => (
            <button 
              key={scope}
              className={styles.recurringOption}
              onClick={() => onSelectScope(scope)}
            >
              <div className={styles.optionContent}>
                <div className={styles.optionTitle}>
                  {getScopeLabel(scope, 'delete')}
                </div>
                <div className={styles.optionDesc}>
                  {getScopeDescription(scope, 'delete', eventType)}
                </div>
              </div>
            </button>
          ))}
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
      </div>
    </>
  );
  
  return createPortal(modalContent, document.body);
}