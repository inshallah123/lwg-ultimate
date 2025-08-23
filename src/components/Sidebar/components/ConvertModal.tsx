import React from 'react';
import { createPortal } from 'react-dom';
import { Event } from '@/types/event';
import { getEventType } from '../logic/eventTypeUtils';
import styles from './ConvertModal.module.css';

interface ConvertModalProps {
  isOpen: boolean;
  event?: Event;
  operation: 'toSimple' | 'toRecurring';
  onConfirm: (scope?: 'single' | 'all') => void;
  onCancel: () => void;
}

/**
 * ConvertModal - 转换类型确认对话框
 * 用于CS (Convert to Simple)操作时的范围选择
 * 根据scenario-matrix.md:
 * - CS-RP: 需要选择"Only This Event"（顺延母事件身份）或"All Events"
 * - CS-VI: 直接转换为独立SE
 */
export function ConvertModal({
  isOpen,
  event,
  operation,
  onConfirm,
  onCancel
}: ConvertModalProps) {
  if (!isOpen || !event) return null;
  
  const eventType = getEventType(event);
  
  // CS-VI不需要选择范围，直接确认
  if (operation === 'toSimple' && eventType === 'VI') {
    const modalContent = (
      <div className={styles.overlay} onClick={onCancel}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Convert to Single Event</h3>
          </div>
          
          <div className={styles.content}>
            <p className={styles.message}>
              This will convert this occurrence to an independent single event, 
              removing it from the recurring series.
            </p>
          </div>
          
          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={() => onConfirm()}>
              Convert
            </button>
          </div>
        </div>
      </div>
    );
    return createPortal(modalContent, document.body);
  }
  
  // CS-RP需要选择范围
  if (operation === 'toSimple' && eventType === 'RP') {
    const modalContent = (
      <div className={styles.overlay} onClick={onCancel}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Convert to Single Event</h3>
          </div>
          
          <div className={styles.content}>
            <p className={styles.question}>
              How would you like to convert this recurring event?
            </p>
            
            <div className={styles.options}>
              <button
                className={styles.optionButton}
                onClick={() => onConfirm('single')}
              >
                <div className={styles.optionLabel}>
                  Only This Event
                </div>
                <div className={styles.optionDescription}>
                  Convert only this occurrence to a single event. 
                  The next occurrence will become the new series parent.
                </div>
              </button>
              
              <button
                className={styles.optionButton}
                onClick={() => onConfirm('all')}
              >
                <div className={styles.optionLabel}>
                  All Events
                </div>
                <div className={styles.optionDescription}>
                  Cancel the recurring series. Only this occurrence will remain as a single event.
                </div>
              </button>
            </div>
          </div>
          
          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
    return createPortal(modalContent, document.body);
  }
  
  // CR-SE: 转为重复事件的确认
  if (operation === 'toRecurring' && eventType === 'SE') {
    const modalContent = (
      <div className={styles.overlay} onClick={onCancel}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Set as Recurring Event</h3>
          </div>
          
          <div className={styles.content}>
            <p className={styles.message}>
              This will convert the event to a recurring series. 
              You'll be able to set the recurrence pattern in the next step.
            </p>
          </div>
          
          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={() => onConfirm()}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
    return createPortal(modalContent, document.body);
  }
  
  return null;
}