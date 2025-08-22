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
  getEventById: (id: string) => Event | undefined;
  getParentEvent: (id: string) => Event | undefined;
  
  // 重复事件删除
  deleteRecurrenceInstance: (parentId: string, instanceDate: Date) => void;
  deleteRecurrenceFromDate: (parentId: string, fromDate: Date) => void;
  
  // 重复事件编辑
  editSingleInstance: (event: Event, updates: UpdateEventInput) => void;
  editThisAndFuture: (event: Event, updates: UpdateEventInput) => void;
  editAllInstances: (event: Event, updates: UpdateEventInput) => void;
  convertToRecurring: (id: string, recurrence: Event['recurrence'], customRecurrence?: number) => void;
  convertToSimple: (event: Event) => void;
  changeRecurrence: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => void;
}


export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
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
      
      getEventById: (id) => {
        return get().events.find(e => e.id === id);
      },
      
      getParentEvent: (id) => {
        const state = get();
        const event = state.events.find(e => e.id === id);
        if (!event) return undefined;
        
        if (event.parentId) {
          return state.events.find(e => e.id === event.parentId);
        }
        return event;
      },
      
      editSingleInstance: (event, updates) => {
        set(state => {
          if (event.parentId) {
            // 已经是修改实例，直接更新
            return {
              events: state.events.map(e =>
                e.id === event.id
                  ? { ...e, ...updates, updatedAt: new Date() }
                  : e
              )
            };
          } else if (event.recurrence !== 'none') {
            // 是母事件的虚拟实例，需要创建新的修改实例
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
      
      editThisAndFuture: (event, updates) => {
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
      
      editAllInstances: (event, updates) => {
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
      },
      
      convertToRecurring: (id, recurrence, customRecurrence) => {
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
      
      convertToSimple: (event) => {
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
      
      changeRecurrence: (event, newRecurrence, customRecurrence) => {
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