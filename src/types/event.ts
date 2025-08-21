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
}

export type CreateEventInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEventInput = Partial<Omit<Event, 'id' | 'createdAt'>>;