import { Event, UpdateEventInput } from '@/types/event';
import { StoreSet } from './types';

// noinspection JSUnusedGlobalSymbols
export const createEditActions = (set: StoreSet) => ({
  editSingleInstance: (event: Event, updates: UpdateEventInput) => {
    set(state => {
      // 检查是否是虚拟实例（ID格式: parentId_timestamp）
      const isVirtualInstance = event.parentId && event.id.includes('_') && event.id.startsWith(event.parentId);
      
      if (event.parentId && !isVirtualInstance) {
        // 已经是真实的修改实例，直接更新
        return {
          events: state.events.map(e =>
            e.id === event.id
              ? { ...e, ...updates, updatedAt: new Date() }
              : e
          )
        };
      } else if (event.parentId && isVirtualInstance) {
        // 是虚拟实例，需要创建新的修改实例
        const modifiedInstance: Event = {
          ...event,
          ...updates,
          id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          parentId: event.parentId,  // 使用虚拟实例的parentId（即母事件ID）
          instanceDate: event.instanceDate || event.date,  // 保留实例日期
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 将原始日期加入母事件的排除列表
        const updatedEvents = state.events.map(e => {
          if (e.id === event.parentId) {  // 找到母事件（不是虚拟实例的ID）
            const excludedDates = e.excludedDates || [];
            return {
              ...e,
              excludedDates: [...excludedDates, event.instanceDate || event.date],
              updatedAt: new Date()
            };
          }
          return e;
        });
        
        return {
          events: [...updatedEvents, modifiedInstance]
        };
      } else if (!event.parentId && event.recurrence !== 'none') {
        // 是母事件本身（第一个实例），创建修改实例并排除原日期
        const modifiedInstance: Event = {
          ...event,
          ...updates,
          id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          parentId: event.id,
          instanceDate: event.date,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 将原始日期加入母事件的排除列表
        const updatedEvents = state.events.map(e => {
          if (e.id === event.id) {
            const excludedDates = e.excludedDates || [];
            return {
              ...e,
              excludedDates: [...excludedDates, event.date],
              updatedAt: new Date()
            };
          }
          return e;
        });
        
        return {
          events: [...updatedEvents, modifiedInstance]
        };
      } else {
        // 普通事件，直接更新
        return {
          events: state.events.map(e =>
            e.id === event.id
              ? { ...e, ...updates, updatedAt: new Date() }
              : e
          )
        };
      }
    });
  },
  
  editThisAndFuture: (event: Event, updates: UpdateEventInput) => {
    set(state => {
      const parentId = event.parentId || event.id;
      const splitDate = event.instanceDate || event.date;
      
      // 获取母事件
      const parentEvent = state.events.find(e => e.id === parentId);
      if (!parentEvent) return state;
      
      // 1. 设置原母事件的结束日期为前一天
      const endDate = new Date(splitDate);
      endDate.setDate(endDate.getDate() - 1);
      
      // 2. 创建新的母事件（从这天开始）
      const newParentEvent: Event = {
        ...parentEvent,
        ...updates,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        date: splitDate,
        excludedDates: [],
        recurrenceEndDate: undefined,
        parentId: undefined,
        instanceDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 更新事件列表
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
  
  editAllInstances: (event: Event, updates: UpdateEventInput) => {
    set(state => {
      const parentId = event.parentId || event.id;
      
      // 如果修改了重复周期，需要特殊处理
      if (updates.recurrence && updates.recurrence !== event.recurrence) {
        // 删除原母事件
        const filteredEvents = state.events.filter(e => e.id !== parentId && e.parentId !== parentId);
        
        // 创建新的母事件
        const parentEvent = state.events.find(e => e.id === parentId);
        if (!parentEvent) return state;
        
        const newEvent: Event = {
          ...parentEvent,
          ...updates,
          id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
      } else {
        // 直接更新母事件
        return {
          events: state.events.map(e => {
            if (e.id === parentId) {
              return { ...e, ...updates, updatedAt: new Date() };
            }
            // 删除所有修改过的实例（它们会继承母事件的新属性）
            if (e.parentId === parentId) {
              return null;
            }
            return e;
          }).filter(Boolean) as Event[]
        };
      }
    });
  }
});