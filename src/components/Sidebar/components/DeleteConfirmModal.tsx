import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
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
      </div>
    </>
  );
  
  return createPortal(modalContent, document.body);
}