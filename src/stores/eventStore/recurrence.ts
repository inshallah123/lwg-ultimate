import { Event } from '@/types/event';
import { StoreSet, StoreGet } from './types';
import { generateRecurrenceInstances, isSameDay } from '@/utils/dateHelpers';

// noinspection JSUnusedGlobalSymbols
export const createRecurrenceActions = (set: StoreSet, get: StoreGet) => ({
  deleteRecurrenceInstance: (parentId: string, instanceDate: Date) => {
    set(state => ({
      events: state.events.map(event => {
        if (event.id === parentId) {
          // 将日期添加到排除列表
          const excludedDates = event.excludedDates || [];
          return {
            ...event,
            excludedDates: [...excludedDates, instanceDate],
            updatedAt: new Date()
          };
        }
        return event;
      })
    }));
  },
  
  deleteRecurrenceFromDate: (parentId: string, fromDate: Date) => {
    set(state => ({
      events: state.events.map(event => {
        if (event.id === parentId) {
          // 设置重复结束日期为前一天
          const endDate = new Date(fromDate);
          endDate.setDate(endDate.getDate() - 1);
          return {
            ...event,
            recurrenceEndDate: endDate,
            updatedAt: new Date()
          };
        }
        return event;
      })
    }));
  },
  
  getEventsInRange: (startDate: Date, endDate: Date) => {
    const result: Event[] = [];
    const state = get();
    
    state.events.forEach(event => {
      // 普通事件或修改过的实例
      if (event.recurrence === 'none' || event.parentId) {
        if (event.date >= startDate && event.date <= endDate) {
          result.push(event);
        }
      }
      // 母事件，生成实例
      else if (!event.parentId) {
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
          // 检查是否有修改过的实例
          const modifiedInstance = state.events.find(e => 
            e.parentId === event.id && 
            e.instanceDate && 
            isSameDay(e.instanceDate, instanceDate)
          );
          
          if (modifiedInstance) {
            result.push(modifiedInstance);
          } else {
            // 创建虚拟实例
            result.push({
              ...event,
              id: `${event.id}_${instanceDate.getTime()}`,
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
  },
  
  convertToRecurring: (id: string, recurrence: Event['recurrence'], customRecurrence?: number) => {
    set(state => ({
      events: state.events.map(event =>
        event.id === id
          ? {
              ...event,
              recurrence,
              customRecurrence,
              excludedDates: [],
              recurrenceEndDate: undefined,
              updatedAt: new Date()
            }
          : event
      )
    }));
  },
  
  convertToSimple: (event: Event) => {
    set(state => {
      if (event.parentId) {
        // 如果是实例，转为独立的简单事件
        return {
          events: state.events.map(e =>
            e.id === event.id
              ? {
                  ...e,
                  recurrence: 'none' as const,
                  parentId: undefined,
                  instanceDate: undefined,
                  excludedDates: undefined,
                  recurrenceEndDate: undefined,
                  customRecurrence: undefined,
                  updatedAt: new Date()
                }
              : e
          )
        };
      } else {
        // 如果是母事件，只保留第一个实例作为简单事件
        return {
          events: state.events.map(e => {
            if (e.id === event.id) {
              return {
                ...e,
                recurrence: 'none' as const,
                excludedDates: undefined,
                recurrenceEndDate: undefined,
                customRecurrence: undefined,
                updatedAt: new Date()
              };
            }
            // 删除所有相关的修改实例
            if (e.parentId === event.id) {
              return null;
            }
            return e;
          }).filter(Boolean) as Event[]
        };
      }
    });
  },
  
  changeRecurrence: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => {
    set(state => {
      const parentId = event.parentId || event.id;
      
      // 删除原母事件及所有相关实例
      const filteredEvents = state.events.filter(e => 
        e.id !== parentId && e.parentId !== parentId
      );
      
      // 获取原母事件作为基础
      const parentEvent = state.events.find(e => e.id === parentId);
      if (!parentEvent) return state;
      
      // 创建新的母事件
      const newEvent: Event = {
        ...parentEvent,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        recurrence: newRecurrence,
        customRecurrence,
        excludedDates: [],
        recurrenceEndDate: undefined,
        parentId: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return {
        events: [...filteredEvents, newEvent]
      };
    });
  }
});