import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';

interface EventStore {
  events: Event[];
  
  // 基础 CRUD 操作
  addEvent: (input: CreateEventInput) => void;
  updateEvent: (id: string, updates: UpdateEventInput) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
  
  // 查询方法
  getEventsByDate: (date: Date) => Event[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => Event[];
  getEventsByTag: (tag: string) => Event[];
  
  // 批量操作
  clearEvents: () => void;
  importEvents: (events: Event[]) => void;
}

// 辅助函数：判断是否同一天
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

// 辅助函数：判断日期是否在范围内
const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (input) => {
        const newEvent: Event = {
          ...input,
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set(state => ({
          events: [...state.events, newEvent]
        }));
      },
      
      updateEvent: (id, updates) => {
        set(state => ({
          events: state.events.map(event =>
            event.id === id
              ? { ...event, ...updates, updatedAt: new Date() }
              : event
          )
        }));
      },
      
      deleteEvent: (id) => {
        set(state => ({
          events: state.events.filter(event => event.id !== id)
        }));
      },
      
      getEvent: (id) => {
        return get().events.find(event => event.id === id);
      },
      
      getEventsByDate: (date) => {
        return get().events.filter(event => isSameDay(event.date, date));
      },
      
      getEventsByDateRange: (startDate, endDate) => {
        return get().events.filter(event => 
          isDateInRange(event.date, startDate, endDate)
        );
      },
      
      getEventsByTag: (tag) => {
        return get().events.filter(event => 
          event.tag === tag || event.customTag === tag
        );
      },
      
      clearEvents: () => {
        set({ events: [] });
      },
      
      importEvents: (events) => {
        set({ events });
      }
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
              updatedAt: new Date(event.updatedAt)
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