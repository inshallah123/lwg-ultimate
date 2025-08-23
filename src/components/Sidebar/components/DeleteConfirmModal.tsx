import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Event } from '@/types/event';
import { DeleteScope } from '@/stores/eventStore/types';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '../store';
import { useCalendarStore } from '@/components/calendar/store';
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
  
  // Hooks必须在顶层调用
  const { getEventById } = useEventStore();
  const { setSelectedDate } = useSidebarStore();
  const { setDate } = useCalendarStore();
  
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
  const isParent = eventType === 'RP';
  
  // 获取母事件信息（如果是VI）
  // 注意：VI是动态生成的，不在state.events中，所以直接用parentId查找
  const parentEvent = event.parentId ? getEventById(event.parentId) : null;
  
  // 处理跳转到母事件
  const handleGoToParent = () => {
    if (parentEvent) {
      // 更新日历视图到母事件所在的日期
      setDate(parentEvent.date);
      // 更新侧边栏选中的日期
      setSelectedDate(parentEvent.date);
      onCancel();
    }
  };
  
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
      <div className={`${styles.modal} ${isParent ? styles.parentModal : styles.instanceModal}`}>
        <div className={styles.iconContainer}>
          <div className={`${styles.iconBackground} ${isParent ? styles.parentIcon : styles.instanceIcon}`}>
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
          <h3 className={styles.title}>
            {isParent ? 'Delete Recurring Series' : 'Delete Event Instance'}
          </h3>
          <p className={styles.message}>
            {isParent 
              ? 'You are about to delete the parent event of a recurring series. How would you like to proceed?'
              : 'You are about to delete an instance of a recurring event. How would you like to proceed?'
            }
          </p>
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
          
          {/* VI显示提示：要删除全部需要到母事件 */}
          {eventType === 'VI' && parentEvent && (
            <div className={styles.infoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>
                To delete all events in the series, please{' '}
                <button className={styles.linkButton} onClick={handleGoToParent}>
                  go to the parent event
                  <span className={styles.parentDate}>
                    ({parentEvent.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </span>
                </button>
              </span>
            </div>
          )}
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