import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';

export interface EventStore {
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

export type StoreSet = (partial: EventStore | Partial<EventStore> | ((state: EventStore) => EventStore | Partial<EventStore>)) => void;
export type StoreGet = () => EventStore;