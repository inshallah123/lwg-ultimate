import { create } from 'zustand';
import { isSameDay } from '@/utils/dateHelpers';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  timeSlot: string;
  tag: string;
}

interface SidebarState {
  // Sidebar 状态
  isOpen: boolean;
  selectedDate: Date | null;
  selectedHour: number | null;  // 存储选中的小时（从周视图点击时）
  
  // EventForm 状态
  isEventFormOpen: boolean;
  eventFormDate: Date | null;
  eventFormHour: number | null;
  
  // Events 状态
  events: Event[];
  
  // Sidebar 方法
  open: (date: Date, hour?: number) => void;
  close: () => void;
  
  // EventForm 方法
  openEventForm: (date?: Date, hour?: number) => void;
  closeEventForm: () => void;
  
  // Events 方法
  addEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  getEventsForDate: (date: Date) => Event[];
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // 初始状态
  isOpen: false,
  selectedDate: null,
  selectedHour: null,
  isEventFormOpen: false,
  eventFormDate: null,
  eventFormHour: null,
  events: [],
  
  // Sidebar 方法
  open: (date, hour) => set({ 
    isOpen: true, 
    selectedDate: date,
    selectedHour: hour ?? null  // 如果有hour就存储，没有就是null
  }),
  close: () => set({ 
    isOpen: false,
    selectedDate: null,
    selectedHour: null
  }),
  
  // EventForm 方法
  openEventForm: (date, hour) => {
    const state = get();
    // 如果没有传入参数，使用 Sidebar 当前选中的日期和时间
    set({
      isEventFormOpen: true,
      eventFormDate: date ?? state.selectedDate ?? new Date(),
      eventFormHour: hour ?? state.selectedHour ?? null
    });
  },
  closeEventForm: () => set({
    isEventFormOpen: false,
    eventFormDate: null,
    eventFormHour: null
  }),
  
  // Events 方法
  addEvent: (event) => set(state => ({
    events: [...state.events, event]
  })),
  
  removeEvent: (id) => set(state => ({
    events: state.events.filter(e => e.id !== id)
  })),
  
  getEventsForDate: (date) => {
    const { events } = get();
    return events.filter(event => isSameDay(event.date, date));
  },
}));