import React from 'react';
import { createPortal } from 'react-dom';
import { Event } from '@/types/event';
import { EditScope } from '@/stores/eventStore/types';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '../store';
import { 
  getEventType, 
  getAvailableScopes, 
  getScopeLabel, 
  getScopeDescription 
} from '../logic/eventTypeUtils';
import styles from './EditRecurringModal.module.css';

interface EditRecurringModalProps {
  isOpen: boolean;
  event?: Event;
  onSelectScope: (scope: EditScope | 'changeCycle') => void;
  onCancel: () => void;
}

export function EditRecurringModal({
  isOpen,
  event,
  onSelectScope,
  onCancel
}: EditRecurringModalProps) {
  // Hooks必须在顶层调用
  const { getEventById } = useEventStore();
  const { setSelectedDate } = useSidebarStore();
  
  if (!isOpen || !event) return null;
  
  const eventType = getEventType(event);
  const availableScopes = getAvailableScopes(eventType, 'edit');
  const showChangeRecurrence = eventType === 'RP';
  const isParent = eventType === 'RP';
  
  // 获取母事件信息（如果是VI）
  // 注意：VI是动态生成的，不在state.events中，所以直接用parentId查找
  const parentEvent = event.parentId ? getEventById(event.parentId) : null;
  
  // 处理跳转到母事件
  const handleGoToParent = () => {
    if (parentEvent) {
      setSelectedDate(parentEvent.date);
      onCancel();
    }
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={`${styles.modal} ${isParent ? styles.parentModal : styles.instanceModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          <div className={`${styles.iconBackground} ${isParent ? styles.parentIcon : styles.instanceIcon}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {isParent ? (
                // 母事件图标 - 日历加循环
                <>
                  <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 10h18M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 16.5A2.5 2.5 0 0113.5 14v0a2.5 2.5 0 012.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                // 虚拟实例图标 - 日历加点
                <>
                  <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 10h18M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="15" r="2" fill="currentColor"/>
                </>
              )}
            </svg>
          </div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>
            {isParent ? 'Edit Recurring Series' : 'Edit Event Instance'}
          </h3>
          <p className={styles.question}>
            {isParent 
              ? 'You are editing the parent event of a recurring series. How would you like to proceed?'
              : 'You are editing an instance of a recurring event. How would you like to proceed?'
            }
          </p>
          
          <div className={styles.options}>
            {availableScopes.map(scope => (
              <button
                key={scope}
                className={styles.optionButton}
                onClick={() => onSelectScope(scope)}
              >
                <div className={styles.optionLabel}>
                  {getScopeLabel(scope, 'edit')}
                </div>
                <div className={styles.optionDescription}>
                  {getScopeDescription(scope, 'edit', eventType)}
                </div>
              </button>
            ))}
            
            {/* VI显示提示：要编辑全部需要到母事件 */}
            {eventType === 'VI' && parentEvent && (
              <div className={styles.infoBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>
                  To edit all events in the series, please{' '}
                  <button className={styles.linkButton} onClick={handleGoToParent}>
                    go to the parent event
                    <span className={styles.parentDate}>
                      ({parentEvent.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                    </span>
                  </button>
                </span>
              </div>
            )}
            
            {showChangeRecurrence && (
              <button
                className={styles.optionButton}
                onClick={() => onSelectScope('changeCycle')}
              >
                <div className={styles.optionLabel}>
                  Change Recurrence Pattern
                </div>
                <div className={styles.optionDescription}>
                  Modify the recurrence pattern for all events in the series
                </div>
              </button>
            )}
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