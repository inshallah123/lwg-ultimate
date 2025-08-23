import { Event, UpdateEventInput, isSimpleEvent } from '@/types/event';
import { EditScope, DeleteScope, StoreSet, StoreGet } from './types';

/**
 * SE (Simple Event) 简单事件操作
 * 根据需求矩阵，SE只支持：
 * - ES (Edit Single): 编辑单个
 * - DS (Delete Single): 删除单个
 * - CR (Convert to Recurring): 转为重复事件
 */

export const createSEOperations = (set: StoreSet, get: StoreGet) => ({
  // SE-ES: 编辑简单事件
  editSimpleEvent: (event: Event, updates: UpdateEventInput, scope: EditScope) => {
    if (!isSimpleEvent(event)) {
      throw new Error('Event is not a simple event');
    }
    
    if (scope !== 'single') {
      throw new Error('Simple events only support single edit');
    }
    
    const updatedEvent = { ...event, ...updates, updatedAt: new Date() };
    
    // 直接更新简单事件
    set(state => ({
      events: state.events.map(e =>
        e.id === event.id ? updatedEvent : e
      )
    }));
  },
  
  // SE-DS: 删除简单事件
  deleteSimpleEvent: (event: Event, scope: DeleteScope) => {
    if (!isSimpleEvent(event)) {
      throw new Error('Event is not a simple event');
    }
    
    if (scope !== 'single') {
      throw new Error('Simple events only support single delete');
    }
    
    // 直接删除简单事件
    set(state => ({
      events: state.events.filter(e => e.id !== event.id)
    }));
  },
  
  // SE-CR: 简单事件转重复事件
  convertSimpleToRecurring: (event: Event, recurrence: Event['recurrence'], customRecurrence?: number, updateInput?: UpdateEventInput) => {
    if (!isSimpleEvent(event)) {
      throw new Error('Event is not a simple event');
    }
    
    if (recurrence === 'none') {
      throw new Error('Cannot convert to non-recurring');
    }
    
    // 更新事件为重复事件，同时应用其他更新
    set(state => ({
      events: state.events.map(e =>
        e.id === event.id
          ? {
              ...e,
              ...updateInput, // 应用其他更新字段
              recurrence,
              customRecurrence,
              excludedDates: [],
              recurrenceEndDate: undefined,
              updatedAt: new Date()
            }
          : e
      )
    }));
  }
});