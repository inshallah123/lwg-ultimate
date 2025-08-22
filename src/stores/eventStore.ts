import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';
import { generateRecurrenceInstances, isSameDay } from '@/utils/dateHelpers';

interface EventStore {
  events: Event[];
  
  // 基础 CRUD 操作
  addEvent: (input: CreateEventInput) => void;
  updateEvent: (id: string, updates: UpdateEventInput) => void;
  deleteEvent: (id: string) => void;
  
  // 重复事件查询
  getEventsInRange: (startDate: Date, endDate: Date) => Event[];
  
  // 重复事件删除
  deleteRecurrenceInstance: (parentId: string, instanceDate: Date) => void;
  deleteRecurrenceFromDate: (parentId: string, fromDate: Date) => void;
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
      },
      
      deleteRecurrenceInstance: (parentId, instanceDate) => {
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
      
      deleteRecurrenceFromDate: (parentId, fromDate) => {
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
      
      getEventsInRange: (startDate, endDate) => {
        const result: Event[] = [];
        const state = useEventStore.getState();
        
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