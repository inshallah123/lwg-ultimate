import { Event, CreateEventInput, UpdateEventInput, isSimpleEvent, isRecurringParent, isVirtualInstance } from '@/types/event';
import { EditScope, DeleteScope, StoreSet, StoreGet } from './types';
import { generateRecurrenceInstances, isSameDay } from '@/utils/dateHelpers';
import { createSEOperations } from './SE';
import { createRPOperations } from './RP';
import { createVIOperations } from './VI';

/**
 * 核心操作实现
 * 提供统一的接口，根据事件类型分发到对应的操作
 */

export const createCoreOperations = (set: StoreSet, get: StoreGet) => {
  // 获取各类型的操作
  const seOps = createSEOperations(set, get);
  const rpOps = createRPOperations(set, get);
  const viOps = createVIOperations(set, get);
  
  return {
    // ========== 基础CRUD ==========
    // C: 创建事件
    addEvent: (input: CreateEventInput) => {
      const newEvent: Event = {
        ...input,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set(state => ({
        events: [...state.events, newEvent]
      }));
    },
    
    // 直接更新事件（内部使用）
    updateEvent: (id: string, updates: UpdateEventInput) => {
      set(state => ({
        events: state.events.map(event =>
          event.id === id
            ? { ...event, ...updates, updatedAt: new Date() }
            : event
        )
      }));
    },
    
    // 直接删除事件（内部使用）
    deleteEvent: (id: string) => {
      set(state => ({
        events: state.events.filter(event => event.id !== id)
      }));
    },
    
    // ========== 统一的编辑接口 ==========
    editEvent: (event: Event, updates: UpdateEventInput, scope: EditScope) => {
      // SE: 只支持 single
      if (isSimpleEvent(event)) {
        if (scope !== 'single') {
          throw new Error('Simple events only support single edit');
        }
        seOps.editSimpleEvent(event, updates, scope);
        return;
      }
      
      // RP: 支持 single/all
      if (isRecurringParent(event)) {
        switch (scope) {
          case 'single':
            rpOps.editRecurringParentSingle(event, updates);
            break;
          case 'all':
            rpOps.editRecurringParentAll(event, updates);
            break;
          case 'future':
            throw new Error('Recurring parent does not support future edit, use all instead');
        }
        return;
      }
      
      // VI: 支持 single/future/all
      if (isVirtualInstance(event)) {
        switch (scope) {
          case 'single':
            viOps.editVirtualInstanceSingle(event, updates);
            break;
          case 'future':
            viOps.editVirtualInstanceFuture(event, updates);
            break;
          case 'all':
            viOps.editVirtualInstanceAll(event, updates);
            break;
        }
        return;
      }
      
      throw new Error('Unknown event type');
    },
    
    // ========== 统一的删除接口 ==========
    deleteEventWithScope: (event: Event, scope: DeleteScope) => {
      // SE: 只支持 single
      if (isSimpleEvent(event)) {
        if (scope !== 'single') {
          throw new Error('Simple events only support single delete');
        }
        seOps.deleteSimpleEvent(event, scope);
        return;
      }
      
      // RP: 支持 single/all
      if (isRecurringParent(event)) {
        switch (scope) {
          case 'single':
            rpOps.deleteRecurringParentSingle(event);
            break;
          case 'all':
            rpOps.deleteRecurringParentAll(event);
            break;
          case 'future':
            throw new Error('Recurring parent does not support future delete, use all instead');
        }
        return;
      }
      
      // VI: 支持 single/future/all
      if (isVirtualInstance(event)) {
        switch (scope) {
          case 'single':
            viOps.deleteVirtualInstanceSingle(event);
            break;
          case 'future':
            viOps.deleteVirtualInstanceFuture(event);
            break;
          case 'all':
            viOps.deleteVirtualInstanceAll(event);
            break;
        }
        return;
      }
      
      throw new Error('Unknown event type');
    },
    
    // ========== 转换操作 ==========
    // CR: 转为重复事件（仅SE）
    convertToRecurring: (event: Event, recurrence: Event['recurrence'], customRecurrence?: number, updateInput?: UpdateEventInput) => {
      if (!isSimpleEvent(event)) {
        throw new Error('Only simple events can be converted to recurring');
      }
      seOps.convertSimpleToRecurring(event, recurrence, customRecurrence, updateInput);
    },
    
    // CS: 转为简单事件（RP/VI）
    convertToSimple: (event: Event) => {
      if (isSimpleEvent(event)) {
        throw new Error('Event is already simple');
      }
      
      if (isRecurringParent(event)) {
        rpOps.convertRecurringParentToSimple(event);
      } else if (isVirtualInstance(event)) {
        viOps.convertVirtualInstanceToSimple(event);
      } else {
        throw new Error('Unknown event type');
      }
    },
    
    // CC: 改变周期（RP/VI）
    changeRecurrence: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => {
      if (isSimpleEvent(event)) {
        throw new Error('Simple events do not have recurrence');
      }
      
      if (isRecurringParent(event)) {
        rpOps.changeRecurringParentCycle(event, newRecurrence, customRecurrence);
      } else if (isVirtualInstance(event)) {
        viOps.changeVirtualInstanceCycle(event, newRecurrence, customRecurrence);
      } else {
        throw new Error('Unknown event type');
      }
    },
    
    // ========== 查询操作 ==========
    getEventById: (id: string) => {
      return get().events.find(e => e.id === id);
    },
    
    getParentEvent: (id: string) => {
      const state = get();
      const event = state.events.find(e => e.id === id);
      if (!event) return undefined;
      
      if (event.parentId) {
        return state.events.find(e => e.id === event.parentId);
      }
      return event;
    },
    
    getEventsInRange: (startDate: Date, endDate: Date) => {
      const result: Event[] = [];
      const state = get();
      
      state.events.forEach(event => {
        // SE: 简单事件，直接判断日期范围
        if (isSimpleEvent(event)) {
          if (event.date >= startDate && event.date <= endDate) {
            result.push(event);
          }
        }
        // RP: 母事件，生成虚拟实例
        else if (isRecurringParent(event)) {
          const instances = generateRecurrenceInstances(
            event.date,
            event.recurrence as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
            startDate,
            endDate,
            event.customRecurrence,
            event.excludedDates,
            event.recurrenceEndDate
          );
          
          instances.forEach(instanceDate => {
            // 创建虚拟实例
            result.push({
              ...event,
              id: `${event.id}_${instanceDate.getTime()}`,
              date: instanceDate,
              parentId: event.id,
              instanceDate: instanceDate
            });
          });
        }
        // 注意：不应该有MI（修改实例）存在
      });
      
      // 按日期排序
      return result.sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    
    // ========== 内部辅助操作 ==========
    // 母事件身份转移（内部使用）
    shiftRecurringParentDate: (parentId: string) => {
      const parent = get().events.find(e => e.id === parentId);
      if (!parent || !isRecurringParent(parent)) {
        throw new Error('Parent event not found or not recurring');
      }
      rpOps.deleteRecurringParentSingle(parent);
    },
    
    // 添加排除日期（内部使用）
    addExcludedDate: (parentId: string, date: Date) => {
      set(state => ({
        events: state.events.map(e => {
          if (e.id === parentId) {
            const excludedDates = e.excludedDates || [];
            return {
              ...e,
              excludedDates: [...excludedDates, date],
              updatedAt: new Date()
            };
          }
          return e;
        })
      }));
    },
    
    // 设置重复结束日期（内部使用）
    setRecurrenceEndDate: (parentId: string, endDate: Date) => {
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
    }
  };
};