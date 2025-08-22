import { create } from 'zustand';
import { Event } from '@/types/event';

interface SidebarState {
  // Sidebar 状态
  isOpen: boolean;
  selectedDate: Date | null;
  selectedHour: number | null;  // 存储选中的小时（从周视图点击时）
  
  // EventForm 状态
  isEventFormOpen: boolean;
  eventFormDate: Date | null;
  eventFormHour: number | null;
  
  // 编辑状态
  editingEvent: Event | null;
  
  // Sidebar 方法
  open: (date: Date, hour?: number) => void;
  close: () => void;
  
  // EventForm 方法
  openEventForm: (date?: Date, hour?: number) => void;
  closeEventForm: () => void;
  
  // 编辑方法
  openEditForm: (event: Event) => void;
  closeEditForm: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // 初始状态
  isOpen: false,
  selectedDate: null,
  selectedHour: null,
  isEventFormOpen: false,
  eventFormDate: null,
  eventFormHour: null,
  editingEvent: null,
  
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
      eventFormHour: hour ?? state.selectedHour ?? null,
      editingEvent: null  // 新增模式，清空编辑事件
    });
  },
  closeEventForm: () => set({
    isEventFormOpen: false,
    eventFormDate: null,
    eventFormHour: null,
    editingEvent: null
  }),
  
  // 编辑方法
  openEditForm: (event) => set({
    isEventFormOpen: true,
    editingEvent: event,
    eventFormDate: event.date,
    eventFormHour: null
  }),
  closeEditForm: () => set({
    isEventFormOpen: false,
    editingEvent: null,
    eventFormDate: null,
    eventFormHour: null
  }),
}));