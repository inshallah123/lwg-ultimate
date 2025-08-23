export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  timeSlot: string;
  tag: 'private' | 'work' | 'balance' | 'custom';
  customTag?: string;
  recurrence: 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customRecurrence?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // 重复事件相关
  parentId?: string;          // 仅用于虚拟实例（VI），指向母事件
  instanceDate?: Date;        // 仅用于虚拟实例（VI），记录实例的原始日期
  excludedDates?: Date[];     // 仅用于母事件（RP），排除的日期
  recurrenceEndDate?: Date;   // 仅用于母事件（RP），重复结束日期
}

export type CreateEventInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEventInput = Partial<Omit<Event, 'id' | 'createdAt'>>;

// 事件类型判断辅助函数
export function isSimpleEvent(event: Event): boolean {
  return event.recurrence === 'none' && !event.parentId;
}

export function isRecurringParent(event: Event): boolean {
  return event.recurrence !== 'none' && !event.parentId;
}

export function isVirtualInstance(event: Event): boolean {
  return !!event.parentId && event.id.includes('_') && event.id.startsWith(event.parentId);
}