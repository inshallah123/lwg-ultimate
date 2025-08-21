import React from 'react';
import styles from './Eventform.module.css';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventForm({ isOpen, onClose }: EventFormProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>新建事件</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          表单内容待实现
        </div>
      </div>
    </>
  );
}