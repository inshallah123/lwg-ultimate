import { Event } from '@/types/event';
import { DeleteScope } from '@/stores/eventStore/types';
import { getEventType } from './eventTypeUtils';
import { useEventStore } from '@/stores/eventStore';

export interface DeleteOperationParams {
  event: Event;
  scope: DeleteScope;
}

/**
 * 执行删除操作
 * 根据scenario-matrix.md的业务逻辑矩阵执行相应操作
 */
export function executeDeleteOperation({ event, scope }: DeleteOperationParams): void {
  const eventType = getEventType(event);
  const store = useEventStore.getState();
  
  // DS-SE: 直接删除
  // 业务逻辑：简单事件直接从数据库删除
  if (eventType === 'SE' && scope === 'single') {
    store.deleteEventWithScope(event, 'single');
    return;
  }
  
  // DS-RP: 顺延母事件身份，删除原母事件
  // 业务逻辑：下一个VI成为新的RP，原RP被删除
  if (eventType === 'RP' && scope === 'single') {
    store.deleteEventWithScope(event, 'single');
    return;
  }
  
  // DS-VI: 标记为已删除，添加到deletedOccurrences
  // 业务逻辑：VI不真正删除，只是在RP的deletedOccurrences中记录
  if (eventType === 'VI' && scope === 'single') {
    store.deleteEventWithScope(event, 'single');
    return;
  }
  
  // DF-VI: 删除此后实例，调整母事件endDate
  // 业务逻辑：将RP的endDate设为当前VI之前，后续VI不再生成
  if (eventType === 'VI' && scope === 'future') {
    store.deleteEventWithScope(event, 'future');
    return;
  }
  
  // DA-RP: 删除母事件，删除所有虚拟实例
  // 业务逻辑：删除RP及其所有VI
  if (eventType === 'RP' && scope === 'all') {
    store.deleteEventWithScope(event, 'all');
    return;
  }
  
  // DA-VI: 删除母事件，删除所有虚拟实例
  // 业务逻辑：通过VI删除整个系列，实际是删除RP及所有VI
  if (eventType === 'VI' && scope === 'all') {
    store.deleteEventWithScope(event, 'all');
    return;
  }
}

/**
 * 获取删除操作的确认信息
 */
export function getDeleteConfirmMessage(
  eventType: 'SE' | 'RP' | 'VI',
  scope: DeleteScope
): string {
  if (eventType === 'SE') {
    return 'Are you sure you want to delete this event?';
  }
  
  if (eventType === 'RP') {
    if (scope === 'single') {
      return 'Delete only this occurrence? The next occurrence will become the series parent.';
    }
    if (scope === 'all') {
      return 'Delete all events in this series?';
    }
  }
  
  if (eventType === 'VI') {
    if (scope === 'single') {
      return 'Delete only this occurrence from the series?';
    }
    if (scope === 'future') {
      return 'Delete this and all future occurrences?';
    }
    if (scope === 'all') {
      return 'Delete all events in this series?';
    }
  }
  
  return 'Delete this event?';
}

/**
 * 获取删除操作后的提示信息
 */
export function getDeleteSuccessMessage(
  eventType: 'SE' | 'RP' | 'VI',
  scope: DeleteScope
): string {
  if (eventType === 'SE') {
    return 'Event deleted successfully';
  }
  
  if (eventType === 'RP') {
    if (scope === 'single') {
      return 'Occurrence deleted, series parent transferred';
    }
    if (scope === 'all') {
      return 'All events in the series have been deleted';
    }
  }
  
  if (eventType === 'VI') {
    if (scope === 'single') {
      return 'Occurrence deleted from the series';
    }
    if (scope === 'future') {
      return 'This and future occurrences have been deleted';
    }
    if (scope === 'all') {
      return 'All events in the series have been deleted';
    }
  }
  
  return 'Event deleted';
}