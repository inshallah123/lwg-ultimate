import { create } from 'zustand';

type ViewMode = 'month' | 'week';
type TransitionDirection = 'left' | 'right';

interface AppState {
  // 视图状态
  viewMode: ViewMode;
  isTransitioning: boolean;
  transitionDirection: TransitionDirection;
  
  // 视图切换方法 - 集成了所有逻辑
  handleViewChange: (newMode: ViewMode) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // 初始状态
  viewMode: 'month',
  isTransitioning: false,
  transitionDirection: 'right',
  
  // 集成的视图切换方法
  handleViewChange: (newMode) => {
    const currentMode = get().viewMode;
    if (newMode === currentMode) return;
    
    set({ 
      transitionDirection: newMode === 'week' ? 'right' : 'left',
      isTransitioning: true 
    });
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        set({ viewMode: newMode });
        requestAnimationFrame(() => {
          set({ isTransitioning: false });
        });
      }, 250);
    });
  }
}));