import { useSidebarStore } from '../store';

export function useSidebarOpen() {
  const open = useSidebarStore(state => state.open);

  return (date: Date, hour?: number) => {
    // 直接传递date和hour，让store处理
    open(date, hour);
  };
}