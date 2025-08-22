import React, { useState, useEffect } from 'react';
import { useSidebarStore } from '../store';
import { useEventStore } from '@/stores/eventStore';
import { Event } from '@/types/event';
import { EditRecurringModal } from './EditRecurringModal';
import styles from './Eventform.module.css';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent?: Event | null;
}

// 时间段选项 - 与WeekView完全对应
const TIME_SLOTS = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00',
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
  '00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00'
];

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
  { value: 'custom', label: 'Custom' }
];

export function EventForm({ isOpen, onClose, editingEvent }: EventFormProps) {
  const eventFormDate = useSidebarStore(state => state.eventFormDate);
  const eventFormHour = useSidebarStore(state => state.eventFormHour);
  const addEvent = useEventStore(state => state.addEvent);
  const updateEvent = useEventStore(state => state.updateEvent);
  const editSingleInstance = useEventStore(state => state.editSingleInstance);
  const editThisAndFuture = useEventStore(state => state.editThisAndFuture);
  const editAllInstances = useEventStore(state => state.editAllInstances);
  const convertToRecurring = useEventStore(state => state.convertToRecurring);
  const convertToSimple = useEventStore(state => state.convertToSimple);
  const changeRecurrence = useEventStore(state => state.changeRecurrence);
  const getParentEvent = useEventStore(state => state.getParentEvent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState<'private' | 'work' | 'balance' | 'custom'>('private');
  const [customTag, setCustomTag] = useState('');
  const [timeSlot, setTimeSlot] = useState('08:00-10:00');
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>('none');
  const [customRecurrence, setCustomRecurrence] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<any>(null);
  const [originalRecurrence, setOriginalRecurrence] = useState<Event['recurrence']>('none');

  // 根据传入的hourIndex设置默认时间段或加载编辑数据
  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        // 编辑模式：加载事件数据
        setTitle(editingEvent.title);
        setDescription(editingEvent.description || '');
        setTag(editingEvent.tag);
        setCustomTag(editingEvent.customTag || '');
        setTimeSlot(editingEvent.timeSlot);
        setRecurrence(editingEvent.recurrence);
        setCustomRecurrence(editingEvent.customRecurrence?.toString() || '');
        setOriginalRecurrence(editingEvent.recurrence);
      } else {
        // 新建模式：设置默认值
        if (eventFormHour !== null && eventFormHour >= 0 && eventFormHour < TIME_SLOTS.length) {
          setTimeSlot(TIME_SLOTS[eventFormHour]);
        } else {
          setTimeSlot('08:00-10:00');
        }
      }
    }
  }, [isOpen, eventFormHour, editingEvent]);

  // 重置表单
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTag('private');
    setCustomTag('');
    setTimeSlot('08:00-10:00');
    setRecurrence('none');
    setCustomRecurrence('');
    setErrors({});
  };

  // 处理提交
  const handleSubmit = () => {
    const newErrors: { title?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = {
      title: title.trim(),
      description: description.trim(),
      date: editingEvent?.date || eventFormDate!,
      timeSlot,
      tag,
      customTag: tag === 'custom' ? customTag.trim() : undefined,
      recurrence,
      customRecurrence: recurrence === 'custom' && customRecurrence ? parseInt(customRecurrence) : undefined
    };

    if (editingEvent) {
      // 编辑模式
      const isRecurringEvent = editingEvent.recurrence !== 'none' || editingEvent.parentId;
      const isChangingRecurrence = originalRecurrence !== recurrence;
      
      if (isRecurringEvent && !isChangingRecurrence) {
        // 编辑重复事件（不改变周期）
        setPendingUpdates(formData);
        setShowEditModal(true);
      } else if (isChangingRecurrence && originalRecurrence !== 'none') {
        // 修改重复周期
        setPendingUpdates(formData);
        setShowEditModal(true);
      } else if (originalRecurrence === 'none' && recurrence !== 'none') {
        // 简单事件转重复事件
        convertToRecurring(editingEvent.id, recurrence, formData.customRecurrence);
        updateEvent(editingEvent.id, formData);
        onClose();
        resetForm();
      } else if (originalRecurrence !== 'none' && recurrence === 'none') {
        // 重复事件转简单事件
        convertToSimple(editingEvent);
        updateEvent(editingEvent.id, formData);
        onClose();
        resetForm();
      } else {
        // 普通编辑
        updateEvent(editingEvent.id, formData);
        onClose();
        resetForm();
      }
    } else {
      // 创建新事件
      if (!eventFormDate) {
        return;
      }
      addEvent(formData);
      onClose();
      resetForm();
    }
  };

  // 处理重复事件的编辑选择
  const handleEditChoice = (choice: 'single' | 'future' | 'all') => {
    if (!editingEvent || !pendingUpdates) return;
    
    const isChangingRecurrence = originalRecurrence !== recurrence;
    
    if (isChangingRecurrence) {
      // 修改重复周期，创建新系列
      changeRecurrence(editingEvent, recurrence, pendingUpdates.customRecurrence);
      const parentId = editingEvent.parentId || editingEvent.id;
      const parentEvent = getParentEvent(parentId);
      if (parentEvent) {
        updateEvent(parentEvent.id, pendingUpdates);
      }
    } else {
      // 不改变周期的编辑
      switch (choice) {
        case 'single':
          editSingleInstance(editingEvent, pendingUpdates);
          break;
        case 'future':
          editThisAndFuture(editingEvent, pendingUpdates);
          break;
        case 'all':
          editAllInstances(editingEvent, pendingUpdates);
          break;
      }
    }
    
    setShowEditModal(false);
    onClose();
    resetForm();
  };

  // 处理取消
  const handleCancel = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  // 格式化日期显示
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{editingEvent ? 'Edit Event' : 'New Event'}</h2>
          <button className={styles.closeButton} onClick={handleCancel}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.dateBar}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 6h12M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{formatDate(eventFormDate)}</span>
        </div>
        
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* 标题输入 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Event Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder="Enter event title"
              autoFocus
            />
            {errors.title && <span className={styles.error}>{errors.title}</span>}
          </div>
          
          {/* 描述输入 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details (optional)"
              rows={3}
            />
          </div>
          
          {/* 标签选择 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tag</label>
            <div className={styles.tagGrid}>
              {TAG_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.tagButton} ${tag === option.value ? styles.tagActive : ''}`}
                  onClick={() => setTag(option.value as 'private' | 'work' | 'balance' | 'custom')}
                  style={{ '--tag-color': option.color } as React.CSSProperties}
                >
                  <span className={styles.tagDot} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 自定义标签输入 */}
          {tag === 'custom' && (
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.input}
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Enter custom tag"
              />
            </div>
          )}
          
          {/* 时间和重复周期并排 */}
          <div className={styles.formRow}>
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
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Recurrence</label>
              <select
                className={styles.select}
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom')}
              >
                {RECURRENCE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 自定义重复周期 */}
          {recurrence === 'custom' && (
            <div className={styles.formGroup}>
              <input
                type="number"
                className={styles.input}
                value={customRecurrence}
                onChange={(e) => {
                  const value = e.target.value;
                  // 只允许正整数
                  if (value === '' || /^[1-9]\d*$/.test(value)) {
                    setCustomRecurrence(value);
                  }
                }}
                placeholder="Enter number of days (e.g., 3 for every 3 days)"
                min="1"
              />
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.confirmButton}
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
      
      {/* 编辑重复事件的选择模态框 */}
      <EditRecurringModal
        isOpen={showEditModal}
        eventTitle={title}
        isChangingRecurrence={originalRecurrence !== recurrence}
        onEditSingle={() => handleEditChoice('single')}
        onEditFuture={() => handleEditChoice('future')}
        onEditAll={() => handleEditChoice('all')}
        onCancel={() => setShowEditModal(false)}
      />
    </>
  );
}