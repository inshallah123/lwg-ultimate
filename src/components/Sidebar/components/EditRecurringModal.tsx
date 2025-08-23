import React from 'react';
import { Event } from '@/types/event';
import { EditScope } from '@/stores/eventStore/types';
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
  if (!isOpen || !event) return null;
  
  const eventType = getEventType(event);
  const availableScopes = getAvailableScopes(eventType, 'edit');
  const showChangeRecurrence = eventType === 'RP';

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Edit Recurring Event</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.question}>
            How would you like to edit this recurring event?
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
}