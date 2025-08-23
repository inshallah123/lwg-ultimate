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
      edit: { single: false, future: false, all: true },  // RP只支持all
      delete: { single: false, future: false, all: true }, // RP只支持all
      convert: { toSimple: false, toRecurring: false },    // RP不支持转换
      changeCycle: true
    },
    VI: {
      edit: { single: true, future: true, all: false },    // VI不直接支持all
      delete: { single: true, future: true, all: false },  // VI不直接支持all
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
    // RP只支持all操作（根据新的需求矩阵）
    return ['all'];
  }
  
  // VI支持single和future，不支持all（all操作需要到母事件）
  return ['single', 'future'];
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
      if (eventType === 'VI') {
        return 'This instance will become an independent event, separate from the series.';
      }
    }
    if (scope === 'future') {
      return '⚠️ Warning: This will split the series. The original series will end before this date, and a new series will be created from this point forward.';
    }
    if (scope === 'all') {
      if (eventType === 'RP') {
        return 'Update the entire series. All instances will inherit the changes.';
      }
    }
  }
  
  if (operation === 'delete') {
    if (scope === 'single') {
      if (eventType === 'VI') {
        return 'Remove only this specific occurrence. The series continues.';
      }
    }
    if (scope === 'future') {
      return '⚠️ Warning: This will end the series at this point. All future occurrences will be permanently removed.';
    }
    if (scope === 'all') {
      if (eventType === 'RP') {
        return '⚠️ Caution: This will permanently delete the entire recurring series and all its instances.';
      }
    }
  }
  
  return '';
}