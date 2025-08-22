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
  parentId?: string;          // 母事件ID（重复实例指向母事件）
  instanceDate?: Date;        // 实例日期（修改过的实例需要记录原始日期）
  excludedDates?: Date[];     // 排除的日期（删除的实例）
  recurrenceEndDate?: Date;   // 重复结束日期（删除未来事件时设置）
}

export type CreateEventInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEventInput = Partial<Omit<Event, 'id' | 'createdAt'>>;