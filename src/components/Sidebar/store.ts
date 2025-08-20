import { create } from 'zustand';

interface SidebarState {
  // 状态
  isOpen: boolean;
  selectedDate: Date | null;
  selectedHour: number | null;  // 存储选中的小时（从周视图点击时）
  
  // 方法
  open: (date: Date, hour?: number) => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  // 初始状态
  isOpen: false,
  selectedDate: null,
  selectedHour: null,
  
  // 方法
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
}));