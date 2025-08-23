import { Event, UpdateEventInput, isRecurringParent } from '@/types/event';
import { EditScope, DeleteScope, StoreSet, StoreGet } from './types';
import { getNextRecurrenceDate } from '@/utils/dateHelpers';

/**
 * RP (Recurring Parent) 母事件操作
 * 根据需求矩阵，RP支持：
 * - ES (Edit Single): 编辑单个实例 -> 创建SE + 母事件身份转移
 * - EA (Edit All): 编辑所有实例 -> 直接修改RP
 * - DS (Delete Single): 删除单个实例 -> 母事件身份转移
 * - DA (Delete All): 删除整个系列 -> 删除RP
 * - CS (Convert to Simple): 转为简单事件 -> 创建SE + 母事件身份转移
 * - CC (Change Cycle): 改变周期 -> 创建新RP + 删除原RP
 */

export const createRPOperations = (set: StoreSet, get: StoreGet) => ({
  // RP-ES: 编辑母事件的单个实例
  editRecurringParentSingle: (event: Event, updates: UpdateEventInput) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    set(state => {
      // 1. 创建新的简单事件（母事件当天的内容+修改）
      const newSimpleEvent: Event = {
        ...event,
        ...updates,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        parentId: undefined,
        recurrence: 'none' as const,
        excludedDates: undefined,
        recurrenceEndDate: undefined,
        customRecurrence: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 2. 计算下一个周期的日期
      const nextDate = getNextRecurrenceDate(
        event.date,
        event.recurrence as any,
        event.customRecurrence
      );
      
      // 3. 更新母事件的开始日期（身份转移）
      const updatedEvents = state.events.map(e => {
        if (e.id === event.id) {
          return {
            ...e,
            date: nextDate,
            updatedAt: new Date()
          };
        }
        return e;
      });
      
      return {
        events: [...updatedEvents, newSimpleEvent]
      };
    });
  },
  
  // RP-EA: 编辑母事件的所有实例
  editRecurringParentAll: (event: Event, updates: UpdateEventInput) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    // 直接修改母事件属性
    set(state => ({
      events: state.events.map(e =>
        e.id === event.id
          ? { ...e, ...updates, updatedAt: new Date() }
          : e
      )
    }));
  },
  
  // RP-DS: 删除母事件的单个实例
  deleteRecurringParentSingle: (event: Event) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    // 计算下一个周期的日期
    const nextDate = getNextRecurrenceDate(
      event.date,
      event.recurrence as any,
      event.customRecurrence
    );
    
    // 将母事件的开始日期推迟到下一个周期
    set(state => ({
      events: state.events.map(e => {
        if (e.id === event.id) {
          return {
            ...e,
            date: nextDate,
            updatedAt: new Date()
          };
        }
        return e;
      })
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
  
  // RP-CS: 母事件转简单事件
  convertRecurringParentToSimple: (event: Event) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    set(state => {
      // 1. 创建新的简单事件（母事件当天的内容）
      const newSimpleEvent: Event = {
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        parentId: undefined,
        recurrence: 'none' as const,
        excludedDates: undefined,
        recurrenceEndDate: undefined,
        customRecurrence: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 2. 计算下一个周期的日期
      const nextDate = getNextRecurrenceDate(
        event.date,
        event.recurrence as any,
        event.customRecurrence
      );
      
      // 3. 更新母事件的开始日期（身份转移）
      const updatedEvents = state.events.map(e => {
        if (e.id === event.id) {
          return {
            ...e,
            date: nextDate,
            updatedAt: new Date()
          };
        }
        return e;
      });
      
      return {
        events: [...updatedEvents, newSimpleEvent]
      };
    });
  },
  
  // RP-CC: 母事件改变周期
  changeRecurringParentCycle: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => {
    if (!isRecurringParent(event)) {
      throw new Error('Event is not a recurring parent');
    }
    
    if (newRecurrence === 'none') {
      throw new Error('Use convertToSimple instead');
    }
    
    set(state => {
      // 创建新的母事件（新周期）
      const newParentEvent: Event = {
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        recurrence: newRecurrence,
        customRecurrence,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 删除原母事件，添加新母事件
      return {
        events: [
          ...state.events.filter(e => e.id !== event.id),
          newParentEvent
        ]
      };
    });
  }
});