import { Event, UpdateEventInput, isRecurringParent } from '@/types/event';
import { /*EditScope, DeleteScope,*/ StoreSet, StoreGet } from './types';

/**
 * RP (Recurring Parent) 母事件操作
 * 根据需求矩阵，RP只支持：
 * - EA (Edit All): 编辑所有实例 -> 直接修改RP
 * - DA (Delete All): 删除整个系列 -> 删除RP
 * - CC (Change Cycle): 改变周期 -> 修改RP的recurrence
 */

export const createRPOperations = (set: StoreSet, _get: StoreGet) => ({
  
  // RP-EA: 编辑母事件的所有实例
  editRecurringParentAll: (event: Event, updates: UpdateEventInput) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    const updatedEvent = { 
      ...event, 
      ...updates,
      // 保持原有的recurrence相关字段不变
      recurrence: event.recurrence,
      customRecurrence: event.customRecurrence,
      recurrenceEndDate: event.recurrenceEndDate,
      excludedDates: event.excludedDates,
      updatedAt: new Date() 
    };
    
    // 修改母事件属性，虚拟实例会在 getEventsInRange 时自动继承新属性
    set(state => ({
      events: state.events.map(e => 
        e.id === event.id ? updatedEvent : e
      )
    }));
  },
  
  // RP-DA: 删除整个母事件系列
  deleteRecurringParentAll: (event: Event) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    // 删除母事件
    set(state => ({
      events: state.events.filter(e => e.id !== event.id)
    }));
  },
  
  // RP-CC: 母事件改变周期
  changeRecurringParentCycle: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    if (newRecurrence === 'none') {
      throw new Error('Cannot change recurrence to none');
    }
    
    // 直接修改母事件的recurrence字段
    set(state => ({
      events: state.events.map(e =>
        e.id === event.id
          ? {
              ...e,
              recurrence: newRecurrence,
              customRecurrence,
              updatedAt: new Date()
            }
          : e
      )
    }));
  }
});