import React, { useRef, useEffect, RefObject } from 'react';

interface ScrollManagerReturn {
  scrollPosition: number;
  isScrolling: boolean;
  rowHeight: number;
  setScrollPosition: (position: number | ((prev: number) => number)) => void;
  scrollToRow: (row: number) => void;
  initializeScroll: (containerRef: RefObject<HTMLDivElement>, initialRow: number) => void;
}

// 这个hook已经不再使用，功能已被useWheelHandler替代
export function useWheelHandler(
  containerRef: RefObject<HTMLDivElement>,
  scrollManager: Pick<ScrollManagerReturn, 'setScrollPosition'>,
  setIsScrolling: (value: boolean) => void,
  setIsDefaultView: (value: boolean) => void,
  scrollVelocityRef?: React.MutableRefObject<number>
) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const scrollSpeed = 0.25;
      const delta = e.deltaY * scrollSpeed;
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        scrollManager.setScrollPosition(prev => {
          const newPosition = prev + delta;
          if (scrollVelocityRef) {
            scrollVelocityRef.current = Math.abs(delta);
          }
          return Math.max(0, newPosition);
        });
      });
      
      setIsScrolling(true);
      setIsDefaultView(false);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        if (scrollVelocityRef) {
          scrollVelocityRef.current = 0;
        }
      }, 200);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef, scrollManager, setIsScrolling, setIsDefaultView, scrollVelocityRef]);
}