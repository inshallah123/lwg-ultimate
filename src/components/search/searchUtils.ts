import { Event } from '@/types/event';
import { formatDate } from '@/utils/dateHelpers';

export interface SearchResult {
  event: Event;
  isRecurringNext?: boolean;
  nextInstanceDate?: Date;
}

// 格式化tag显示
export const formatTag = (tag: string, customTag?: string): string => {
  if (tag === 'custom' && customTag) return customTag;
  const tagMap: Record<string, string> = {
    'private': 'Private',
    'work': 'Work',
    'balance': 'Balance',
    'custom': 'Custom'
  };
  return tagMap[tag] || tag;
};

// 搜索事件
export const searchEvents = (
  query: string,
  allEventsInRange: Event[],
  today: Date
): SearchResult[] => {
  if (!query.trim()) return [];
  
  const searchQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  const addedParentIds = new Set<string>();
  
  
  allEventsInRange.forEach(event => {
    // 搜索匹配逻辑
    const titleMatch = event.title.toLowerCase().includes(searchQuery);
    const descMatch = event.description?.toLowerCase().includes(searchQuery);
    const tagMatch = formatTag(event.tag, event.customTag).toLowerCase().includes(searchQuery);
    const timeMatch = event.timeSlot.toLowerCase().includes(searchQuery);
    const dateMatch = formatDate(event.date, 'short').toLowerCase().includes(searchQuery);
    
    
    if (titleMatch || descMatch || tagMatch || timeMatch || dateMatch) {
      // 如果是重复事件的实例
      if (event.parentId) {
        if (!addedParentIds.has(event.parentId)) {
          addedParentIds.add(event.parentId);
          // 找到该重复事件的下一个实例
          const futureInstances = allEventsInRange.filter(e => 
            (e.parentId === event.parentId || e.id === event.parentId) && 
            e.date >= today
          );
          
          if (futureInstances.length > 0) {
            const nextInstance = futureInstances.sort((a, b) => 
              a.date.getTime() - b.date.getTime()
            )[0];
            results.push({
              event: nextInstance,
              isRecurringNext: true,
              nextInstanceDate: nextInstance.date
            });
          }
        }
      } else if (event.recurrence !== 'none') {
        // 母事件
        if (!addedParentIds.has(event.id)) {
          addedParentIds.add(event.id);
          const futureInstances = allEventsInRange.filter(e => 
            (e.parentId === event.id || e.id === event.id) && 
            e.date >= today
          );
          
          if (futureInstances.length > 0) {
            const nextInstance = futureInstances.sort((a, b) => 
              a.date.getTime() - b.date.getTime()
            )[0];
            results.push({
              event: nextInstance,
              isRecurringNext: true,
              nextInstanceDate: nextInstance.date
            });
          }
        }
      } else {
        // 普通事件
        results.push({ event });
      }
    }
  });
  
  // 按日期排序，最近的在前
  return results
    .sort((a, b) => {
      const dateA = a.nextInstanceDate || a.event.date;
      const dateB = b.nextInstanceDate || b.event.date;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 10); // 限制最多显示10个结果
};