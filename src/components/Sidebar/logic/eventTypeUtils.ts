import { Event } from '@/types/event';

/**
 * 判断事件类型
 * SE (Simple Event): recurrence='none' 且无 parentId
 * RP (Recurring Parent): recurrence!='none' 且无 parentId  
 * VI (Virtual Instance): 有 parentId
 */
export function getEventType(event: Event): 'SE' | 'RP' | 'VI' {
  if (event.parentId) {
    return 'VI';
  }
  if (event.recurrence !== 'none') {
    return 'RP';
  }
  return 'SE';
}

/**
 * 根据事件类型判断支持的操作
 * 基于scenario-matrix.md的业务逻辑矩阵
 */
export function getSupportedOperations(eventType: 'SE' | 'RP' | 'VI') {
  const operations = {
    SE: {
      edit: { single: true, future: false, all: false },
      delete: { single: true, future: false, all: false },
      convert: { toSimple: false, toRecurring: true },
      changeCycle: false
    },
    RP: {
      edit: { single: true, future: false, all: true },
      delete: { single: true, future: false, all: true },
      convert: { toSimple: true, toRecurring: false },
      changeCycle: true
    },
    VI: {
      edit: { single: true, future: true, all: true },
      delete: { single: true, future: true, all: true },
      convert: { toSimple: true, toRecurring: false },
      changeCycle: false
    }
  };
  
  return operations[eventType];
}

/**
 * 判断是否需要显示范围选择对话框
 */
export function needsScopeSelection(
  eventType: 'SE' | 'RP' | 'VI',
  operation: 'edit' | 'delete'
): boolean {
  // SE永远不需要范围选择
  if (eventType === 'SE') return false;
  
  // RP和VI都需要范围选择
  return true;
}

/**
 * 获取可用的范围选项
 */
export function getAvailableScopes(
  eventType: 'SE' | 'RP' | 'VI',
  operation: 'edit' | 'delete'
): Array<'single' | 'future' | 'all'> {
  if (eventType === 'SE') {
    return ['single'];
  }
  
  if (eventType === 'RP') {
    // RP不支持future
    return ['single', 'all'];
  }
  
  // VI支持所有范围
  return ['single', 'future', 'all'];
}

/**
 * 获取范围选项的显示文本
 */
export function getScopeLabel(
  scope: 'single' | 'future' | 'all',
  operation: 'edit' | 'delete'
): string {
  const labels = {
    edit: {
      single: 'Only This Event',
      future: 'This and Future Events',
      all: 'All Events in Series'
    },
    delete: {
      single: 'Only This Event',
      future: 'This and Future Events', 
      all: 'All Events in Series'
    }
  };
  
  return labels[operation][scope];
}

/**
 * 获取范围选项的描述文本
 */
export function getScopeDescription(
  scope: 'single' | 'future' | 'all',
  operation: 'edit' | 'delete',
  eventType: 'SE' | 'RP' | 'VI'
): string {
  if (operation === 'edit') {
    if (scope === 'single') {
      if (eventType === 'RP') {
        return 'Convert this occurrence to a single event and edit it independently';
      }
      if (eventType === 'VI') {
        return 'Edit only this occurrence, creating an independent event';
      }
    }
    if (scope === 'future') {
      return 'Edit this and all future occurrences, creating a new series';
    }
    if (scope === 'all') {
      return 'Edit all occurrences in the series';
    }
  }
  
  if (operation === 'delete') {
    if (scope === 'single') {
      if (eventType === 'RP') {
        return 'Delete only this occurrence, next occurrence becomes the series parent';
      }
      if (eventType === 'VI') {
        return 'Delete only this occurrence from the series';
      }
    }
    if (scope === 'future') {
      return 'Delete this and all future occurrences';
    }
    if (scope === 'all') {
      return 'Delete all occurrences in the series';
    }
  }
  
  return '';
}