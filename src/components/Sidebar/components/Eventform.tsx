import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';
import { EditScope } from '@/stores/eventStore/types';
import { useEventStore } from '@/stores/eventStore';
import { useSidebarStore } from '../store';
import { changeRecurrence } from '../logic/convertOperations';
import { TIME_SLOTS } from '@/utils/dateHelpers';
import styles from './Eventform.module.css';

interface EventFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'convertToRecurring';
  event?: Event;
  editScope?: EditScope | 'changeCycle' | null;
  onClose: () => void;
  onSubmit?: (data: UpdateEventInput) => void;
}

const TAG_OPTIONS = [
  { value: 'private', label: 'Private', color: '#ff6b9d' },
  { value: 'work', label: 'Work', color: '#667eea' },
  { value: 'balance', label: 'Balance', color: '#48bb78' },
  { value: 'custom', label: 'Custom', color: '#a0aec0' }
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'No Repeat' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom (Days)' }
];

export function EventForm({
  isOpen,
  mode,
  event,
  editScope,
  onClose,
  onSubmit
}: EventFormProps) {
  const eventStore = useEventStore();
  const eventFormDate = useSidebarStore(state => state.eventFormDate);
  const eventFormHour = useSidebarStore(state => state.eventFormHour);
  
  // Ref for title input to set focus
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [timeSlot, setTimeSlot] = useState('08:00-10:00');
  const [tag, setTag] = useState<'private' | 'work' | 'balance' | 'custom'>('private');
  const [customTag, setCustomTag] = useState('');
  const [recurrence, setRecurrence] = useState<Event['recurrence']>('none');
  const [customRecurrence, setCustomRecurrence] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 判断是否应该禁用recurrence字段
  // CR操作时（mode='convertToRecurring'）应该显示recurrence
  const isConvertToRecurring = mode === 'convertToRecurring';
  const disableRecurrence = mode === 'edit' && editScope !== 'changeCycle';
  
  // 判断是否仅显示recurrence字段（CC操作）
  const onlyShowRecurrence = editScope === 'changeCycle';
  
  // 初始化表单数据
  useEffect(() => {
    if (!isOpen) return;
    
    if ((mode === 'edit' || mode === 'convertToRecurring') && event) {
      // 编辑模式或CR操作：加载事件数据
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(new Date(event.date));
      setTimeSlot(event.timeSlot);
      setTag(event.tag);
      setCustomTag(event.customTag || '');
      setRecurrence(event.recurrence);
      setCustomRecurrence(event.customRecurrence?.toString() || '');
    } else if (mode === 'create') {
      // 创建模式：使用默认值
      if (eventFormDate) {
        setDate(eventFormDate);
      }
      if (eventFormHour !== null && eventFormHour >= 0 && eventFormHour < TIME_SLOTS.length) {
        setTimeSlot(TIME_SLOTS[eventFormHour]);
      } else {
        // 如果没有指定时间槽（月视图），使用默认值
        setTimeSlot('08:00-10:00');
      }
    }
  }, [isOpen, mode, event, eventFormDate, eventFormHour]);
  
  // 当表单打开且不是只显示recurrence时，自动聚焦到title输入框
  useEffect(() => {
    const onlyShowRecurrence = editScope === 'changeCycle';
    if (isOpen && !onlyShowRecurrence && titleInputRef.current) {
      // 使用setTimeout确保DOM已经完全渲染
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, editScope]);
  
  // 重置表单
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setTimeSlot('08:00-10:00');
    setTag('private');
    setCustomTag('');
    setRecurrence('none');
    setCustomRecurrence('');
    setErrors({});
  }, []);
  
  // 验证表单
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!onlyShowRecurrence) {
      if (!title.trim()) {
        newErrors.title = 'Title is required';
      }
      
      if (tag === 'custom' && !customTag.trim()) {
        newErrors.customTag = 'Custom tag is required';
      }
    }
    
    if (recurrence === 'custom' && !customRecurrence.trim()) {
      newErrors.customRecurrence = 'Custom days is required';
    }
    
    if (recurrence === 'custom' && customRecurrence) {
      const days = parseInt(customRecurrence);
      if (isNaN(days) || days < 1 || days > 365) {
        newErrors.customRecurrence = 'Days must be between 1 and 365';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, tag, customTag, recurrence, customRecurrence, onlyShowRecurrence]);
  
  // 处理提交
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (editScope === 'changeCycle' && event) {
      // CC操作：改变重复周期
      const customDays = recurrence === 'custom' ? parseInt(customRecurrence) : undefined;
      changeRecurrence(event, recurrence, customDays);
      onClose();
      resetForm();
      return;
    }
    
    if (mode === 'create') {
      // C操作：创建新事件
      const input: CreateEventInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        timeSlot,
        tag,
        customTag: tag === 'custom' ? customTag.trim() : undefined,
        recurrence,
        customRecurrence: recurrence === 'custom' ? parseInt(customRecurrence) : undefined
      };
      eventStore.addEvent(input);
      onClose();
      resetForm();
    } else if (mode === 'convertToRecurring' && onSubmit) {
      // CR操作：将现有事件转换为重复事件
      const updates: UpdateEventInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        timeSlot,
        tag,
        customTag: tag === 'custom' ? customTag.trim() : undefined,
        recurrence,
        customRecurrence: recurrence === 'custom' ? parseInt(customRecurrence) : undefined
      };
      onSubmit(updates);
      onClose();
      resetForm();
    } else if (mode === 'edit' && onSubmit) {
      // ES/EF/EA操作：编辑事件
      const updates: UpdateEventInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        timeSlot,
        tag,
        customTag: tag === 'custom' ? customTag.trim() : undefined
      };
      
      // 如果不禁用recurrence，则包含recurrence更新
      if (!disableRecurrence) {
        updates.recurrence = recurrence;
        updates.customRecurrence = recurrence === 'custom' ? parseInt(customRecurrence) : undefined;
      }
      
      onSubmit(updates);
      onClose();
      resetForm();
    }
  }, [
    mode, event, editScope, title, description, date, timeSlot, tag, customTag,
    recurrence, customRecurrence, validateForm, onSubmit, onClose, resetForm,
    eventStore, disableRecurrence
  ]);
  
  if (!isOpen) return null;
  
  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {onlyShowRecurrence ? 'Change Recurrence Pattern' :
             mode === 'create' ? 'Create Event' : 'Edit Event'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {!onlyShowRecurrence && (
            <>
              {/* 标题 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Title *</label>
                <input
                  ref={titleInputRef}
                  type="text"
                  className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
              </div>
              
              {/* 描述 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event description (optional)"
                  rows={3}
                />
              </div>
              
              {/* 日期和时间 */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Date</label>
                  <input
                    type="date"
                    className={`${styles.input} ${styles.readOnly}`}
                    value={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
                    readOnly
                    title="Date is determined by the calendar context"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Time Slot</label>
                  <select
                    className={styles.select}
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* 标签 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Tag</label>
                <div className={styles.tagOptions}>
                  {TAG_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.tagOption} ${tag === option.value ? styles.tagOptionActive : ''}`}
                      style={{ '--tag-color': option.color } as React.CSSProperties}
                      onClick={() => setTag(option.value as any)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {tag === 'custom' && (
                  <input
                    type="text"
                    className={`${styles.input} ${styles.customTagInput} ${errors.customTag ? styles.inputError : ''}`}
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter custom tag"
                  />
                )}
                {errors.customTag && <span className={styles.error}>{errors.customTag}</span>}
              </div>
            </>
          )}
          
          {/* 重复设置 */}
          {(mode === 'create' || isConvertToRecurring || !disableRecurrence) && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Recurrence</label>
              <select
                className={styles.select}
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Event['recurrence'])}
              >
                {RECURRENCE_OPTIONS
                  .filter(option => {
                    // CC操作时排除 'none' 选项
                    if (editScope === 'changeCycle') {
                      return option.value !== 'none';
                    }
                    return true;
                  })
                  .map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              
              {recurrence === 'custom' && (
                <div className={styles.customRecurrenceInput}>
                  <input
                    type="number"
                    className={`${styles.input} ${errors.customRecurrence ? styles.inputError : ''}`}
                    value={customRecurrence}
                    onChange={(e) => setCustomRecurrence(e.target.value)}
                    placeholder="Number of days"
                    min="1"
                    max="365"
                  />
                  <span className={styles.customRecurrenceLabel}>days</span>
                  {errors.customRecurrence && <span className={styles.error}>{errors.customRecurrence}</span>}
                </div>
              )}
            </div>
          )}
          
          {/* 按钮 */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {onlyShowRecurrence ? 'Save Changes' :
               mode === 'create' ? 'Create Event' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
}