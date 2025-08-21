import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';

interface EventStore {
  events: Event[];
  
  // 基础 CRUD 操作
  addEvent: (input: CreateEventInput) => void;
  updateEvent: (id: string, updates: UpdateEventInput) => void;
  deleteEvent: (id: string) => void;
}


export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      events: [],
      
      addEvent: (input) => {
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