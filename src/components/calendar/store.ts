import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  getMonthDays, 
  getWeekStart, 
  getWeekDays, 
  formatWeekRange,
  MONTH_NAMES 
} from '@/utils/dateHelpers';

interface CalendarStore {
  currentDate: Date;
  viewMode: 'month' | 'week';
  isTransitioning: boolean;
  transitionDirection: 'left' | 'right';
  
  setDate: (date: Date) => void;
  handleViewChange: (mode: 'month' | 'week') => void;
  
  navigateWeek: (delta: number) => void;
  goToToday: () => void;
  
  getMonthDays: () => Date[];
  getWeekDays: () => Date[];
  getMonthHeader: () => string;
  getWeekHeader: () => string;
}

export const useCalendarStore = create<CalendarStore>()(
  subscribeWithSelector((set, get) => ({
  currentDate: new Date(),
  viewMode: 'month',
  isTransitioning: false,
  transitionDirection: 'right',
  
  setDate: (date) => set({ currentDate: date }),
  
  handleViewChange: (mode) => {
    const currentMode = get().viewMode;
    if (mode === currentMode) return;
    
    set({ 
      transitionDirection: mode === 'week' ? 'right' : 'left',
      isTransitioning: true 
    });
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        set({ viewMode: mode });
        requestAnimationFrame(() => {
          set({ isTransitioning: false });
        });
      }, 250);
    });
  },
  
  navigateWeek: (delta) => set((state) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + delta * 7);
    return { currentDate: newDate };
  }),
  
  goToToday: () => set({ currentDate: new Date() }),
  
  getMonthDays: () => {
    const { currentDate } = get();
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  },
  
  getWeekDays: () => {
    const { currentDate } = get();
    const weekStart = getWeekStart(currentDate);
    return getWeekDays(weekStart);
  },
  
  getMonthHeader: () => {
    const { currentDate } = get();
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  },
  
  getWeekHeader: () => {
    const weekDays = get().getWeekDays();
    return formatWeekRange(weekDays);
  },
})));