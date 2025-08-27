import { Event, UpdateEventInput, isVirtualInstance } from '@/types/event';
import { StoreSet/*, StoreGet*/ } from './types';
import { generateEventId, calculateEndDateBeforeInstance } from '@/utils/eventHelpers';

/**
 * VI (Virtual Instance) 虚拟实例操作
 * 根据需求矩阵，VI支持：
 * - ES (Edit Single): 编辑单个 -> 创建SE + 添加excludedDate
 * - EF (Edit Future): 编辑此后所有 -> 截断原RP + 创建新RP
 * - DS (Delete Single): 删除单个 -> 添加excludedDate
 * - DF (Delete Future): 删除此后所有 -> 设置recurrenceEndDate
 * - CS (Convert to Simple): 转为简单事件 -> 创建SE + 添加excludedDate
 */

export const createVIOperations = (set: StoreSet) => ({
  // VI-ES: 编辑虚拟实例为单个
  editVirtualInstanceSingle: (event: Event, updates: UpdateEventInput) => {
    if (!isVirtualInstance(event)) {
      throw new Error('Event is not a virtual instance');
    }
    
    const parentId = event.parentId!;
    const instanceDate = event.instanceDate || event.date;
    
    set(state => {
      // 1. 创建新的简单事件
      const newSimpleEvent: Event = {
        ...event,
        ...updates,
        id: generateEventId(),
        parentId: undefined,
        recurrence: 'none' as const,
        excludedDates: undefined,
        recurrenceEndDate: undefined,
        customRecurrence: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 2. 在母事件的excludedDates中添加该日期
      const updatedEvents = state.events.map(e => {
        if (e.id === parentId) {
          const excludedDates = e.excludedDates || [];
          return {
            ...e,
            excludedDates: [...excludedDates, instanceDate],
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
  
  // VI-EF: 从虚拟实例开始编辑此后所有
  editVirtualInstanceFuture: (event: Event, updates: UpdateEventInput) => {
    if (!isVirtualInstance(event)) {
      throw new Error('Event is not a virtual instance');
    }
    
    const parentId = event.parentId!;
    const splitDate = event.instanceDate || event.date;
    
    set(state => {
      const parentEvent = state.events.find(e => e.id === parentId);
      if (!parentEvent) {
        throw new Error('Parent event not found');
      }
      
      // 1. 设置原母事件的recurrenceEndDate为前一天
      const endDate = new Date(splitDate);
      endDate.setDate(endDate.getDate() - 1);
      
      // 2. 创建新的母事件（从该日期开始）
      const newParentEvent: Event = {
        ...parentEvent,
        ...updates,
        id: generateEventId(),
        date: splitDate,
        excludedDates: [],
        recurrenceEndDate: undefined,
        parentId: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 3. 更新原母事件
      const updatedEvents = state.events.map(e => {
        if (e.id === parentId) {
          return {
            ...e,
            recurrenceEndDate: endDate,
            updatedAt: new Date()
          };
        }
        return e;
      });
      
      return {
        events: [...updatedEvents, newParentEvent]
      };
    });
  },
  
  
  // VI-DS: 删除单个虚拟实例
  deleteVirtualInstanceSingle: (event: Event) => {
    if (!isVirtualInstance(event)) {
      throw new Error('Event is not a virtual instance');
    }
    
    const parentId = event.parentId!;
    const instanceDate = event.instanceDate || event.date;
    
    // 将该日期加入母事件的excludedDates
    set(state => ({
      events: state.events.map(e => {
        if (e.id === parentId) {
          const excludedDates = e.excludedDates || [];
          return {
            ...e,
            excludedDates: [...excludedDates, instanceDate],
            updatedAt: new Date()
          };
        }
        return e;
      })
    }));
  },
  
  // VI-DF: 从虚拟实例开始删除此后所有
  deleteVirtualInstanceFuture: (event: Event) => {
    if (!isVirtualInstance(event)) {
      throw new Error('Event is not a virtual instance');
    }
    
    const parentId = event.parentId!;
    const endDate = calculateEndDateBeforeInstance(event.instanceDate || event.date);
    
    // 设置母事件的recurrenceEndDate
    set(state => ({
      events: state.events.map(e => {
        if (e.id === parentId) {
          return {
            ...e,
            recurrenceEndDate: endDate,
            updatedAt: new Date()
          };
        }
        return e;
      })
    }));
  },
  
  
  // VI-CS: 虚拟实例转简单事件
  convertVirtualInstanceToSimple: (event: Event) => {
    if (!isVirtualInstance(event)) {
      throw new Error('Event is not a virtual instance');
    }
    
    const parentId = event.parentId!;
    const instanceDate = event.instanceDate || event.date;
    
    set(state => {
      // 1. 创建新的简单事件
      const newSimpleEvent: Event = {
        ...event,
        id: generateEventId(),
        parentId: undefined,
        recurrence: 'none' as const,
        excludedDates: undefined,
        recurrenceEndDate: undefined,
        customRecurrence: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 2. 在母事件的excludedDates中添加该日期
      const updatedEvents = state.events.map(e => {
        if (e.id === parentId) {
          const excludedDates = e.excludedDates || [];
          return {
            ...e,
            excludedDates: [...excludedDates, instanceDate],
            updatedAt: new Date()
          };
        }
        return e;
      });
      
      return {
        events: [...updatedEvents, newSimpleEvent]
      };
    });
  }
});