import { useRef, useCallback } from 'react';

export function useDoubleClick<T extends any[]>(
  onSingleClick: (...args: T) => void,
  onDoubleClick: (...args: T) => void,
  delay: number = 250
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleClick = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      onDoubleClick(...args);
    } else {
      timeoutRef.current = setTimeout(() => {
        onSingleClick(...args);
        timeoutRef.current = null;
      }, delay);
    }
  }, [onSingleClick, onDoubleClick, delay]);
  
  return handleClick;
}