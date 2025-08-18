import React from 'react';
import styles from './EventModal.module.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any;
  onSave: (event: any) => void;
  onDelete?: (id: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete
}) => {
  // TODO: Implement event form
  // TODO: Handle form validation
  // TODO: Date/time pickers
  // TODO: Recurrence settings
  // TODO: Reminder settings
  // TODO: Color picker
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Event Details</h2>
        </div>
        <div className={styles.content}>
          <form>
            {/* Event details form */}
          </form>
        </div>
        <div className={styles.footer}>
          {/* Action buttons */}
        </div>
      </div>
    </>
  );
};