import { Event, CreateEventInput, UpdateEventInput } from '@/types/event';

// 操作类型定义（对应需求文档矩阵）
export type EditScope = 'single' | 'future' | 'all';
export type DeleteScope = 'single' | 'future' | 'all';

export interface EventStore {
  events: Event[];
  
  // ========== 基础操作 ==========
  // C (Create) - 创建
  addEvent: (input: CreateEventInput) => void;
  
  // ES/EF/EA (Edit) - 编辑
  editEvent: (event: Event, updates: UpdateEventInput, scope: EditScope) => void;
  
  // DS/DF/DA (Delete) - 删除  
  deleteEventWithScope: (event: Event, scope: DeleteScope) => void;
  
  // CR (Convert to Recurring) - 转为重复事件（仅SE）
  convertToRecurring: (event: Event, recurrence: Event['recurrence'], customRecurrence?: number, updateInput?: UpdateEventInput) => void;
  
  // CS (Convert to Simple) - 转为简单事件（仅RP/VI）
  convertToSimple: (event: Event) => void;
  
  // CC (Change Cycle) - 改变重复周期（仅RP/VI）
  changeRecurrence: (event: Event, newRecurrence: Event['recurrence'], customRecurrence?: number) => void;
  
  // ========== 查询操作 ==========
  getEventsInRange: (startDate: Date, endDate: Date) => Event[];
  getEventById: (id: string) => Event | undefined;
  getParentEvent: (id: string) => Event | undefined;
  
  // ========== 内部操作（供上层接口调用） ==========
  // 直接更新事件（用于简单事件）
  updateEvent: (id: string, updates: UpdateEventInput) => void;
  
  // 直接删除事件（用于简单事件）
  deleteEvent: (id: string) => void;
  
  // 添加排除日期（VI-DS的核心操作）
  addExcludedDate: (parentId: string, date: Date) => void;
  
  // 设置重复结束日期（VI-DF的核心操作）
  setRecurrenceEndDate: (parentId: string, endDate: Date) => void;
}

export type StoreSet = (partial: EventStore | Partial<EventStore> | ((state: EventStore) => EventStore | Partial<EventStore>)) => void;
export type StoreGet = () => EventStore;