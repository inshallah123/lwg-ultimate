import { Event, UpdateEventInput } from '@/types/event';
import { EditScope } from '@/stores/eventStore/types';
import { getEventType } from './eventTypeUtils';
import { useEventStore } from '@/stores/eventStore';

export interface EditOperationParams {
  event: Event;
  updates: UpdateEventInput;
  scope: EditScope;
}

/**
 * 执行编辑操作
 * 根据scenario-matrix.md的业务逻辑矩阵执行相应操作
 */
export function executeEditOperation({ event, updates, scope }: EditOperationParams): void {
  const eventType = getEventType(event);
  const store = useEventStore.getState();
  
  // 所有编辑操作都不包括recurrence字段
  const updatesWithoutRecurrence = { ...updates };
  delete updatesWithoutRecurrence.recurrence;
  delete updatesWithoutRecurrence.customRecurrence;
  
  // ES-SE: 直接修改事件
  if (eventType === 'SE' && scope === 'single') {
    store.editEvent(event, updatesWithoutRecurrence, 'single');
    return;
  }
  
  // RP不支持single编辑（根据新的需求矩阵）
  if (eventType === 'RP' && scope === 'single') {
    throw new Error('Recurring parent does not support single edit');
  }
  
  // ES-VI: 当前VI转为SE，脱离母事件
  // 业务逻辑：该VI独立出来成为SE，不再属于重复系列
  if (eventType === 'VI' && scope === 'single') {
    store.editEvent(event, updatesWithoutRecurrence, 'single');
    return;
  }
  
  // EF-VI: 截断原RP至当前VI之前，创建新RP管理此后实例
  // 业务逻辑：原RP的endDate设为当前VI之前，创建新RP管理当前及之后的实例
  if (eventType === 'VI' && scope === 'future') {
    store.editEvent(event, updatesWithoutRecurrence, 'future');
    return;
  }
  
  // EA-RP: 修改母事件，更新所有虚拟实例
  // 业务逻辑：修改RP，所有VI自动继承新的属性
  if (eventType === 'RP' && scope === 'all') {
    store.editEvent(event, updatesWithoutRecurrence, 'all');
    return;
  }
  
  // VI不支持all编辑（需要到母事件）
  if (eventType === 'VI' && scope === 'all') {
    throw new Error('To edit all instances, please edit the parent event');
  }
}

/**
 * 判断编辑操作是否需要禁用recurrence字段
 */
export function shouldDisableRecurrence(
  eventType: 'SE' | 'RP' | 'VI',
  scope: EditScope
): boolean {
  // 根据scenario-matrix.md，所有编辑操作都不包括recurrence
  return true;
}

/**
 * 获取编辑操作后的提示信息
 */
export function getEditSuccessMessage(
  eventType: 'SE' | 'RP' | 'VI',
  scope: EditScope
): string {
  if (eventType === 'SE') {
    return 'Event updated successfully';
  }
  
  if (eventType === 'RP') {
    if (scope === 'single') {
      return 'This occurrence has been converted to a single event';
    }
    if (scope === 'all') {
      return 'All events in the series have been updated';
    }
  }
  
  if (eventType === 'VI') {
    if (scope === 'single') {
      return 'This occurrence has been updated independently';
    }
    if (scope === 'future') {
      return 'This and future occurrences have been updated';
    }
    if (scope === 'all') {
      return 'All events in the series have been updated';
    }
  }
  
  return 'Event updated';
}