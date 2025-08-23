import { Event } from '@/types/event';
import { getEventType } from './eventTypeUtils';
import { useEventStore } from '@/stores/eventStore';

/**
 * CS (Convert to Simple) - 转为简单事件
 * 仅RP/VI支持
 * 根据scenario-matrix.md:
 * - CS-RP: 顺延母事件身份/原母事件转为SE
 * - CS-VI: 转换为独立SE，脱离母事件
 */
export function convertToSimple(event: Event): void {
  const eventType = getEventType(event);
  const store = useEventStore.getState();
  
  if (eventType === 'SE') {
    return;
  }
  
  // CS-RP: 顺延母事件身份，原母事件转为SE
  // 业务逻辑：下一个VI成为新的RP，当前RP转为SE
  // CS-VI: 转换为独立SE，脱离母事件
  // 业务逻辑：该VI独立成为SE，不再属于重复系列
  store.convertToSimple(event);
}

/**
 * CR (Convert to Recurring) - 转为重复事件
 * 仅SE支持
 * 根据scenario-matrix.md:
 * - CR-SE: 转换为RP，生成虚拟实例
 */
export function convertToRecurring(
  event: Event,
  recurrence: Event['recurrence'],
  customRecurrence?: number
): void {
  const eventType = getEventType(event);
  const store = useEventStore.getState();
  
  if (eventType !== 'SE') {
    return;
  }
  
  // CR-SE: 转换为RP，生成虚拟实例
  // 业务逻辑：SE变为RP，根据recurrence规则生成VI
  store.convertToRecurring(event, recurrence, customRecurrence);
}

/**
 * CC (Change Cycle) - 改变重复周期
 * 仅RP支持（VI不支持，根据scenario-matrix.md）
 */
export function changeRecurrence(
  event: Event,
  newRecurrence: Event['recurrence'],
  customRecurrence?: number
): void {
  const eventType = getEventType(event);
  const store = useEventStore.getState();
  
  if (eventType !== 'RP') {
    return;
  }
  
  // CC-RP: 修改recurrence，重新生成虚拟实例
  // 业务逻辑：更新RP的重复规则，删除旧VI，生成新VI
  store.changeRecurrence(event, newRecurrence, customRecurrence);
}

/**
 * 判断是否可以转为简单事件
 */
export function canConvertToSimple(event: Event): boolean {
  const eventType = getEventType(event);
  // 根据新的需求矩阵，只有VI支持CS
  return eventType === 'VI';
}

/**
 * 判断是否可以转为重复事件
 */
export function canConvertToRecurring(event: Event): boolean {
  const eventType = getEventType(event);
  return eventType === 'SE';
}

/**
 * 判断是否可以修改重复周期
 */
export function canChangeRecurrence(event: Event): boolean {
  const eventType = getEventType(event);
  return eventType === 'RP';
}

/**
 * 获取转换操作的确认信息
 */
export function getConvertConfirmMessage(
  event: Event,
  operation: 'toSimple' | 'toRecurring'
): string {
  const eventType = getEventType(event);
  
  if (operation === 'toSimple') {
    if (eventType === 'VI') {
      return 'Convert this occurrence to an independent single event? It will no longer be part of the recurring series.';
    }
  }
  
  if (operation === 'toRecurring') {
    return 'Convert this event to a recurring series?';
  }
  
  return '';
}

/**
 * 获取转换操作后的提示信息
 */
export function getConvertSuccessMessage(
  eventType: 'SE' | 'RP' | 'VI',
  operation: 'toSimple' | 'toRecurring'
): string {
  if (operation === 'toSimple') {
    if (eventType === 'VI') {
      return 'Occurrence converted to independent event';
    }
  }
  
  if (operation === 'toRecurring') {
    return 'Event converted to recurring series';
  }
  
  return 'Conversion completed';
}