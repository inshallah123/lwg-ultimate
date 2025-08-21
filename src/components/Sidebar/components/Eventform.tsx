import React, { useState, useEffect } from 'react';
import { useSidebarStore } from '../store';
import { useEventStore } from '@/stores/eventStore';
import styles from './Eventform.module.css';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
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

export function EventForm({ isOpen, onClose }: EventFormProps) {
  const eventFormDate = useSidebarStore(state => state.eventFormDate);
  const eventFormHour = useSidebarStore(state => state.eventFormHour);
  const addEvent = useEventStore(state => state.addEvent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState<'private' | 'work' | 'balance' | 'custom'>('private');
  const [customTag, setCustomTag] = useState('');
  const [timeSlot, setTimeSlot] = useState('08:00-10:00');
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>('none');
  const [customRecurrence, setCustomRecurrence] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  // 根据传入的hourIndex设置默认时间段
  useEffect(() => {
    if (isOpen) {
      if (eventFormHour !== null && eventFormHour >= 0 && eventFormHour < TIME_SLOTS.length) {
        setTimeSlot(TIME_SLOTS[eventFormHour]);
      } else {
        setTimeSlot('08:00-10:00');
      }
    }
  }, [isOpen, eventFormHour]);

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

    // 创建新事件
    if (!eventFormDate) {
      console.error('No date selected for event');
      return;
    }

    addEvent({
      title: title.trim(),
      description: description.trim(),
      date: eventFormDate,
      timeSlot,
      tag,
      customTag: tag === 'custom' ? customTag.trim() : undefined,
      recurrence,
      customRecurrence: recurrence === 'custom' && customRecurrence ? parseInt(customRecurrence) : undefined
    });
    
    // 关闭表单并重置
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
          <h2 className={styles.title}>New Event</h2>
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
              Create Event
            </button>
          </div>
        </form>
      </div>
    </>
  );
}