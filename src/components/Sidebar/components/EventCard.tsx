import React, { useState } from 'react';
import { Event } from '@/types/event';
import { useEventStore } from '@/stores/eventStore';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
}

// Tag 颜色映射
const TAG_COLORS: Record<string, string> = {
  private: '#ff6b9d',
  work: '#667eea',
  balance: '#48bb78',
  custom: '#a0aec0'
};

// 格式化重复周期显示
const formatRecurrence = (recurrence: string, customDays?: number): string => {
  switch (recurrence) {
    case 'none':
      return '';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    case 'custom':
      return customDays ? `Every ${customDays} days` : 'Custom';
    default:
      return '';
  }
};

// 截断描述文本
const truncateText = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export function EventCard({ event, onEdit }: EventCardProps) {
  const deleteEvent = useEventStore(state => state.deleteEvent);
  const deleteRecurrenceInstance = useEventStore(state => state.deleteRecurrenceInstance);
  const deleteRecurrenceFromDate = useEventStore(state => state.deleteRecurrenceFromDate);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };
  
  // 判断是否为重复事件
  // 修改实例（有parentId且recurrence='none'）应该被当作重复事件处理
  // 母事件（recurrence!='none'）也是重复事件
  const isRecurringEvent = event.recurrence !== 'none' || !!event.parentId;
  
  // 判断是否是被修改过的实例（不是虚拟实例）
  // 虚拟实例的ID格式: parentId_timestamp
  const isVirtualInstance = event.parentId && event.id.includes('_') && event.id.startsWith(event.parentId);
  const isModifiedInstance = !!event.parentId && event.recurrence === 'none' && !isVirtualInstance;
  
  // 删除整个重复系列
  const confirmDelete = () => {
    if (event.parentId) {
      // 如果是实例，删除母事件
      deleteEvent(event.parentId);
    } else {
      deleteEvent(event.id);
    }
    setShowDeleteModal(false);
  };
  
  // 删除单个实例
  const deleteSingle = () => {
    if (isModifiedInstance) {
      // 修改过的实例：直接删除该事件
      deleteEvent(event.id);
    } else {
      // 虚拟实例或母事件：将日期加入排除列表
      const parentId = event.parentId || event.id;
      const instanceDate = event.instanceDate || event.date;
      deleteRecurrenceInstance(parentId, instanceDate);
    }
    setShowDeleteModal(false);
  };
  
  // 删除该日期及之后的所有实例
  const deleteFuture = () => {
    const parentId = event.parentId || event.id;
    const instanceDate = event.instanceDate || event.date;
    deleteRecurrenceFromDate(parentId, instanceDate);
    setShowDeleteModal(false);
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(event);
  };
  
  const recurrenceText = formatRecurrence(event.recurrence, event.customRecurrence);
  const tagColor = TAG_COLORS[event.tag] || TAG_COLORS.custom;
  const displayTag = event.tag === 'custom' && event.customTag ? event.customTag : event.tag;
  const isRecurringInstance = !!event.parentId;
  
  return (
    <>
      <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{event.title}</h3>
        <div className={styles.actions}>
          <button 
            className={styles.editButton}
            onClick={handleEdit}
            title="Edit event"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667 1 1-3.667 9-9z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button 
            className={styles.deleteButton}
            onClick={handleDelete}
            title="Delete event"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {event.description && (
        <p className={styles.description}>
          {truncateText(event.description)}
        </p>
      )}
      
      <div className={styles.meta}>
        <div className={styles.timeSlot}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 3.5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span>{event.timeSlot}</span>
        </div>
        
        <div className={styles.tags}>
          <span 
            className={styles.tag}
            style={{ '--tag-color': tagColor } as React.CSSProperties}
          >
            <span className={styles.tagDot} />
            {displayTag}
          </span>
          
          {(recurrenceText || isRecurringInstance) && (
            <span className={styles.recurrence}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path 
                  d="M2 7a5 5 0 0110 0 5 5 0 01-10 0z" 
                  stroke="currentColor" 
                  strokeWidth="1.2"
                />
                <path 
                  d="M10 4.5L12 7l2.5-2.5" 
                  stroke="currentColor" 
                  strokeWidth="1.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              {recurrenceText || 'Recurring'}
            </span>
          )}
        </div>
      </div>
      </div>
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title={isRecurringEvent ? "Delete Recurring Event" : "Delete Event"}
        message={isRecurringEvent 
          ? `How would you like to delete "${event.title}"?`
          : `Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isRecurring={isRecurringEvent}
        onDeleteSingle={deleteSingle}
        onDeleteFuture={deleteFuture}
      />
    </>
  );
}