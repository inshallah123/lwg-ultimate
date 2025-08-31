import { Event, CreateEventInput, UpdateEventInput, isSimpleEvent, isRecurringParent, isVirtualInstance } from '@/types/event';
import { EditScope, DeleteScope, StoreSet, StoreGet } from './types';
import { generateRecurrenceInstances, isSameDay } from '@/utils/dateHelpers';
import { generateEventId, generateVirtualInstanceId } from '@/utils/eventHelpers';
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
  const viOps = createVIOperations(set);
  
  return {
    // ========== 基础CRUD ==========
    // C: 创建事件
    addEvent: (input: CreateEventInput) => {
      const newEvent: Event = {
        ...input,
        id: generateEventId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set(state => ({
        events: [...state.events, newEvent]
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
      
      // RP: 只支持 all（根据新的需求矩阵）
      if (isRecurringParent(event)) {
        if (scope !== 'all') {
          throw new Error('Recurring parent only supports editing all instances');
        }
        rpOps.editRecurringParentAll(event, updates);
        return;
      }
      
      // VI: 支持 single/future，不支持all（需要到母事件）
      if (isVirtualInstance(event)) {
        switch (scope) {
          case 'single':
            viOps.editVirtualInstanceSingle(event, updates);
            break;
          case 'future':
            viOps.editVirtualInstanceFuture(event, updates);
            break;
          case 'all':
            throw new Error('To edit all instances, please edit the parent event');
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
      
      // RP: 只支持 all（根据新的需求矩阵）
      if (isRecurringParent(event)) {
        if (scope !== 'all') {
          throw new Error('Recurring parent only supports deleting all instances');
        }
        rpOps.deleteRecurringParentAll(event);
        return;
      }
      
      // VI: 支持 single/future，不支持all（需要到母事件）
      if (isVirtualInstance(event)) {
        switch (scope) {
          case 'single':
            viOps.deleteVirtualInstanceSingle(event);
            break;
          case 'future':
            viOps.deleteVirtualInstanceFuture(event);
            break;
          case 'all':
            throw new Error('To delete all instances, please delete the parent event');
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
    
    // CS: 转为简单事件（仅VI，RP不支持）
    convertToSimple: (event: Event) => {
      if (isSimpleEvent(event)) {
        throw new Error('Event is already simple');
      }
      
      if (isRecurringParent(event)) {
        throw new Error('Recurring parent cannot be converted to simple event');
      } else if (isVirtualInstance(event)) {
        viOps.convertVirtualInstanceToSimple(event);
      } else {
        throw new Error('Unknown event type');
      }
    },
    
    // CC: 改变周期（仅RP）
    changeRecurrence: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => {
      if (isSimpleEvent(event)) {
        throw new Error('Simple events do not have recurrence');
      }
      
      if (isRecurringParent(event)) {
        rpOps.changeRecurringParentCycle(event, newRecurrence, customRecurrence);
      } else if (isVirtualInstance(event)) {
        throw new Error('Virtual instances cannot change recurrence directly. Edit the parent event instead.');
      } else {
        throw new Error('Unknown event type');
      }
    },
    
    // ========== 查询操作 ==========
      getEventById: (id: string) => {
      return get().events.find(e => e.id === id);
    },
    
    getEventsInRange: (startDate: Date, endDate: Date) => {
      const result: Event[] = [];
      const state = get();
      
      // 确保比较的是日期部分，忽略时间
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const endDateOnly = new Date(endDate);
      endDateOnly.setHours(23, 59, 59, 999);
      
      state.events.forEach(event => {
        // SE: 简单事件，直接判断日期范围
        if (isSimpleEvent(event)) {
          const eventDateOnly = new Date(event.date);
          eventDateOnly.setHours(0, 0, 0, 0);
          
          if (eventDateOnly >= startDateOnly && eventDateOnly <= endDateOnly) {
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
            // 检查是否是母事件的当天实例
            const isSameDate = isSameDay(instanceDate, event.date);
            
            if (isSameDate) {
              // 母事件的当天实例，直接使用母事件本身
              result.push({
                ...event
                // 不添加 instanceDate，保持母事件的原始状态
              });
            } else {
              // 创建虚拟实例
              result.push({
                ...event,
                id: generateVirtualInstanceId(event.id, instanceDate),
                date: instanceDate,
                parentId: event.id,
                instanceDate: instanceDate
              });
            }
          });
        }
      });
      
      // 按日期排序
      return result.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  };
};