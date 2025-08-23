/**
 * 事件相关的工具函数
 */

/**
 * 生成唯一的事件ID
 */
export function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 生成虚拟实例的ID
 */
export function generateVirtualInstanceId(parentId: string, instanceDate: Date): string {
  return `${parentId}_${instanceDate.getTime()}`;
}

/**
 * 解析虚拟实例ID获取父事件ID
 */
export function parseVirtualInstanceId(instanceId: string): { parentId: string; timestamp: number } | null {
  const parts = instanceId.split('_');
  if (parts.length < 4) return null; // event_timestamp_random_instanceTime
  
  const parentId = parts.slice(0, 3).join('_');
  const timestamp = parseInt(parts[3], 10);
  
  if (isNaN(timestamp)) return null;
  
  return { parentId, timestamp };
}

/**
 * 计算从指定日期开始的前一天（用于设置recurrenceEndDate）
 */
export function calculateEndDateBeforeInstance(instanceDate: Date): Date {
  const endDate = new Date(instanceDate);
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}