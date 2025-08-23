import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EventStore } from './types';
import { createCoreOperations } from './core';

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      
      // 使用新的核心操作
      ...createCoreOperations(set, get)
    }),
    {
      name: 'event-storage',
      // 序列化和反序列化日期对象
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          
          // 转换日期字符串回 Date 对象
          if (data.state && data.state.events) {
            data.state.events = data.state.events.map((event: any) => ({
              ...event,
              date: new Date(event.date),
              createdAt: new Date(event.createdAt),
              updatedAt: new Date(event.updatedAt),
              instanceDate: event.instanceDate ? new Date(event.instanceDate) : undefined,
              recurrenceEndDate: event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : undefined,
              excludedDates: event.excludedDates ? event.excludedDates.map((d: string) => new Date(d)) : undefined
            }));
          }
          
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

// 导出类型
export type { EventStore } from './types';