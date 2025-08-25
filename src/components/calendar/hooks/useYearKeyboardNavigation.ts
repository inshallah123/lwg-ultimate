import { useEffect } from 'react';
import { DEFAULT_VALUES } from '../constants/yearview';

interface YearKeyboardNavigationOptions {
  setDate: (date: Date) => void;
  setIsDefaultView: (value: boolean) => void;
  scrollToYear: (year: number) => void;
}

export function useYearKeyboardNavigation({
  setDate,
  setIsDefaultView,
  scrollToYear
}: YearKeyboardNavigationOptions) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果焦点在输入框中，不处理快捷键
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // 空格键回到今年
      if (e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const today = new Date();
        setDate(today);
        setIsDefaultView(true);
        
        // 滚动到今年
        scrollToYear(today.getFullYear());
        
        // 短暂后退出默认视图模式
        setTimeout(() => setIsDefaultView(false), DEFAULT_VALUES.DEFAULT_VIEW_TIMEOUT);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setDate, setIsDefaultView, scrollToYear]);
}