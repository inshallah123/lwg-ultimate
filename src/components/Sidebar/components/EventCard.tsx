import React, { useState, useCallback } from 'react';
import { Event, UpdateEventInput } from '@/types/event';
import { EditScope, DeleteScope } from '@/stores/eventStore/types';
import { useEventStore } from '@/stores/eventStore';
import { getEventType, needsScopeSelection } from '../logic/eventTypeUtils';
import { executeEditOperation } from '../logic/editOperations';
import { executeDeleteOperation } from '../logic/deleteOperations';
import { 
  canConvertToSimple, 
  canConvertToRecurring,
  convertToSimple,
  convertToRecurring 
} from '../logic/convertOperations';
import { EditRecurringModal } from './EditRecurringModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ConvertModal } from './ConvertModal';
import { EventForm } from './Eventform';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
}

// 格式化重复周期显示
const formatRecurrence = (event: Event, getEventById?: (id: string) => Event | undefined): string => {
  const eventType = getEventType(event);
  
  if (eventType === 'VI') {
    // 对于虚拟实例，显示母事件的重复周期
    if (getEventById && event.parentId) {
      const parent = getEventById(event.parentId);
      if (parent) {
        switch (parent.recurrence) {
          case 'none':
            return '🔁 Instance';
          case 'weekly':
            return '🔁 Weekly';
          case 'monthly':
            return '🔁 Monthly';
          case 'quarterly':
            return '🔁 Quarterly';
          case 'yearly':
            return '🔁 Yearly';
          case 'custom':
            return parent.customRecurrence ? `🔁 Every ${parent.customRecurrence} days` : '🔁 Custom';
          default:
            return '🔁 Instance';
        }
      }
    }
    return '🔁 Recurring Instance';
  }
  
  if (eventType === 'RP') {
    switch (event.recurrence) {
      case 'none':
        return '';
      case 'weekly':
        return '🔁 Weekly';
      case 'monthly':
        return '🔁 Monthly';
      case 'quarterly':
        return '🔁 Quarterly';
      case 'yearly':
        return '🔁 Yearly';
      case 'custom':
        return event.customRecurrence ? `🔁 Every ${event.customRecurrence} days` : '🔁 Custom';
      default:
        return '';
    }
  }
  
  return '';
};

// 截断描述文本
const truncateText = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export function EventCard({ event }: EventCardProps) {
  const eventType = getEventType(event);
  const { getEventById } = useEventStore();
  
  // 判断是否显示更多菜单按钮
  const showMoreMenuButton = canConvertToSimple(event) || canConvertToRecurring(event);
  
  // 状态管理
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertOperation, setConvertOperation] = useState<'toSimple' | 'toRecurring' | null>(null);
  const [editScope, setEditScope] = useState<EditScope | 'changeCycle' | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // 处理编辑按钮点击
  const handleEditClick = useCallback(() => {
    if (needsScopeSelection(eventType)) {
      setShowEditModal(true);
    } else {
      // SE直接打开编辑表单
      setEditScope('single');
      setShowEventForm(true);
    }
  }, [eventType]);
  
  // 处理编辑范围选择
  const handleEditScopeSelect = useCallback((scope: EditScope | 'changeCycle') => {
    setShowEditModal(false);
    setEditScope(scope);
    setShowEventForm(true);
  }, []);
  
  // 处理编辑表单提交
  const handleEditSubmit = useCallback((updates: UpdateEventInput) => {
    if (convertOperation === 'toRecurring') {
      // CR操作：转换为重复事件，同时应用所有用户输入的更新
      if (updates.recurrence && updates.recurrence !== 'none') {
        convertToRecurring(event, updates.recurrence, updates.customRecurrence, updates);
      }
    } else if (editScope && editScope !== 'changeCycle') {
      executeEditOperation({ event, updates, scope: editScope });
    }
    setShowEventForm(false);
    setEditScope(null);
    setConvertOperation(null);
  }, [event, editScope, convertOperation]);
  
  // 处理删除按钮点击
  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);
  
  // 处理删除范围选择
  const handleDeleteScopeSelect = useCallback((scope: DeleteScope) => {
    executeDeleteOperation({ event, scope });
    setShowDeleteModal(false);
  }, [event]);
  
  // 处理转换为简单事件按钮点击
  const handleConvertToSimpleClick = useCallback(() => {
    if (canConvertToSimple(event)) {
      setConvertOperation('toSimple');
      setShowConvertModal(true);
    }
    setShowMoreMenu(false);
  }, [event]);
  
  // 处理转换为重复事件按钮点击
  const handleConvertToRecurringClick = useCallback(() => {
    if (canConvertToRecurring(event)) {
      setConvertOperation('toRecurring');
      setShowConvertModal(true);
    }
    setShowMoreMenu(false);
  }, [event]);
  
  // 处理转换确认
  const handleConvertConfirm = useCallback((_scope?: 'single' | 'all') => {
    setShowConvertModal(false);
    
    if (convertOperation === 'toSimple') {
      // CS操作
      convertToSimple(event);
      setConvertOperation(null);
    } else if (convertOperation === 'toRecurring') {
      // CR操作：打开表单设置重复参数
      // 注意：不要清除convertOperation，EventForm需要它来判断模式
      setShowEventForm(true);
    }
  }, [event, convertOperation]);
  
  // 显示逻辑
  const recurrenceText = formatRecurrence(event, getEventById);
  const displayTag = event.tag === 'custom' && event.customTag ? event.customTag : event.tag;
  const tagClass = event.tag || 'custom';
  
  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{event.title}</h3>
            {recurrenceText && (
              <span className={styles.recurrenceLabel}>{recurrenceText}</span>
            )}
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.editButton}
              onClick={handleEditClick}
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
              onClick={handleDeleteClick}
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
            
            {/* 更多选项按钮 - 仅在有可用操作时显示 */}
            {showMoreMenuButton && (
              <div className={styles.moreMenuContainer}>
                <button 
                  className={styles.moreButton}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  title="More options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1" fill="currentColor"/>
                    <circle cx="8" cy="8" r="1" fill="currentColor"/>
                    <circle cx="8" cy="13" r="1" fill="currentColor"/>
                  </svg>
                </button>
                
                {showMoreMenu && (
                  <div className={styles.moreMenu}>
                    {canConvertToSimple(event) && (
                      <button 
                        className={styles.menuItem}
                        onClick={handleConvertToSimpleClick}
                      >
                        Convert to Single Event
                      </button>
                    )}
                    {canConvertToRecurring(event) && (
                      <button 
                        className={styles.menuItem}
                        onClick={handleConvertToRecurringClick}
                      >
                        Set as Recurring
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {event.description && (
          <p className={styles.description}>
            {truncateText(event.description)}
          </p>
        )}
        
        <div className={styles.footer}>
          <div className={styles.metadata}>
            <span className={styles.time}>
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })} • {event.timeSlot}
            </span>
          </div>
          
          <span 
            className={`${styles.tag} ${styles[tagClass]}`}
          >
            {displayTag}
          </span>
        </div>
      </div>
      
      {/* 编辑范围选择模态框 */}
      <EditRecurringModal
        isOpen={showEditModal}
        event={event}
        onSelectScope={handleEditScopeSelect}
        onCancel={() => setShowEditModal(false)}
      />
      
      {/* 删除确认模态框 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        event={event}
        onSelectScope={handleDeleteScopeSelect}
        onCancel={() => setShowDeleteModal(false)}
      />
      
      {/* 转换确认模态框 */}
      <ConvertModal
        isOpen={showConvertModal}
        event={event}
        operation={convertOperation || 'toSimple'}
        onConfirm={handleConvertConfirm}
        onCancel={() => {
          setShowConvertModal(false);
          setConvertOperation(null);
        }}
      />
      
      {/* 编辑表单 */}
      {showEventForm && (
        <EventForm
          isOpen={showEventForm}
          mode={convertOperation === 'toRecurring' ? 'convertToRecurring' : 'edit'}
          event={convertOperation === 'toRecurring' ? { ...event, recurrence: 'weekly' } : event}
          editScope={editScope}
          onClose={() => {
            setShowEventForm(false);
            setEditScope(null);
            setConvertOperation(null);
          }}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}