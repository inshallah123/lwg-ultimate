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
  
  
  // 确保 today 只包含日期部分，不包含时间
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  
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
      // 如果是虚拟实例（VI）
      if (event.parentId) {
        // 对于重复事件的虚拟实例，按母事件ID分组，只显示最近的一个
        if (!addedParentIds.has(event.parentId)) {
          addedParentIds.add(event.parentId);
          // 找到该重复事件的下一个实例（包括今天及以后的）
          const futureInstances = allEventsInRange.filter(e => 
            (e.parentId === event.parentId || e.id === event.parentId) && 
            e.date >= todayStart
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
      } 
      // 如果是母事件（RP）
      else if (event.recurrence !== 'none') {
        // 对于母事件，如果还没有添加过相关实例
        if (!addedParentIds.has(event.id)) {
          addedParentIds.add(event.id);
          // 母事件本身也可能是一个有效的实例（比如当天）
          // 找到所有实例（包括母事件本身和虚拟实例）
          const allInstances = allEventsInRange.filter(e => 
            e.id === event.id || e.parentId === event.id
          );
          
          // 筛选出今天及以后的实例
          const futureInstances = allInstances.filter(e => e.date >= todayStart);
          
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
      } 
      // 简单事件（SE）
      else {
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