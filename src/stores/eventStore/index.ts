import { create } from 'zustand';
import { persist/*, createJSONStorage*/ } from 'zustand/middleware';
import { EventStore } from './types';
import { createCoreOperations } from './core';
import { Event } from '@/types/event';

// 判断是否在Electron环境中
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// 自定义存储适配器
const sqliteStorage = {
  getItem: async (name: string) => {
    if (!isElectron) {
      // 如果不在Electron环境，使用localStorage作为后备
      const str = localStorage.getItem(name);
      if (!str) return null;
      return JSON.parse(str);
    }
    
    try {
      const events = await window.electronAPI.database.getAllEvents();
      
      // 转换日期字符串为Date对象
      const parsedEvents = events.map((event: any) => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        recurrenceEndDate: event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : undefined,
        excludedDates: event.excludedDates ? event.excludedDates.map((d: string) => new Date(d)) : undefined
      }));
      
      return { state: { events: parsedEvents }, version: 0 };
    } catch (error) {
      console.error('Failed to load events from database:', error);
      return null;
    }
  },
  
  setItem: async (name: string, value: unknown) => {
    if (!isElectron) {
      // 如果不在Electron环境，使用localStorage作为后备
      localStorage.setItem(name, JSON.stringify(value));
      return;
    }
    
    try {
      // 如果value是字符串，先解析为对象
      let parsedValue = value;
      if (typeof value === 'string') {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          return;
        }
      }
      
      // zustand persist可能传递不同格式的value
      let events: Event[] = [];
      
      // 处理不同的value格式
      if (parsedValue && typeof parsedValue === 'object') {
        const valueWithState = parsedValue as { state?: { events?: Event[] }, events?: Event[] };
        if (valueWithState.state && valueWithState.state.events !== undefined) {
          // 标准格式: { state: { events: [] }, version: number }
          events = valueWithState.state.events;
        } else if (valueWithState.events !== undefined) {
          // 直接的events格式: { events: [] }
          events = valueWithState.events;
        } else if (Array.isArray(parsedValue)) {
          // 直接的数组格式
          events = parsedValue;
        }
      }
      
      await window.electronAPI.database.syncEvents(events);
    } catch (error) {
      console.error('Failed to save events to database:', error);
    }
  },
  
  removeItem: async (name: string) => {
    if (!isElectron) {
      localStorage.removeItem(name);
      return;
    }
    
    try {
      // 清空数据库
      await window.electronAPI.database.syncEvents([]);
    } catch (error) {
      console.error('Failed to clear database:', error);
    }
  }
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      
      // 使用新的核心操作
      ...createCoreOperations(set, get)
    }),
    {
      name: 'event-storage',
      storage: sqliteStorage
    }
  )
);

// 导出类型
export type { EventStore } from './types';