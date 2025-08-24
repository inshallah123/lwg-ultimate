/**
 * 导航层定义 - 系统瞬态变化
 * 判据：操作结果无需持久化到存储
 * 包含：视图切换、临时状态变更、UI反馈
 */

/**
 * 导航操作 N - 瞬态操作
 * 不产生需要持久化的状态变化
 */
export interface Navigation {
  // 视图状态切换
  viewState?: {
    current: string;
    available: string[];
    transition?: (from: string, to: string) => void;
  };
  
  // 临时选择状态（不持久化）
  selection?: {
    selected: string | string[] | null;
    hover: string | null;
    focus: string | null;
  };
  
  // 临时展开/折叠状态
  expansion?: {
    expanded: Set<string>;
    toggle: (id: string) => void;
  };
  
  // 临时过滤/排序（不影响原数据）
  display?: {
    filter?: string;
    sort?: { field: string; order: 'asc' | 'desc' };
    page?: number;
    pageSize?: number;
  };
  
  // UI反馈状态（加载、错误等）
  feedback?: {
    loading?: boolean;
    error?: string | null;
    message?: string | null;
  };
}

/**
 * 导航验证器
 */
export class NavigationValidator {
  /**
   * 验证导航操作定义
   */
  static validate(navigation: any): navigation is Navigation {
    if (!navigation || typeof navigation !== 'object') {
      return true; // 导航是可选的
    }
    
    const validKeys = ['viewState', 'selection', 'expansion', 'display', 'feedback'];
    const keys = Object.keys(navigation);
    
    const invalidKeys = keys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid navigation keys: ${invalidKeys.join(', ')}`);
    }
    
    // 确保这些操作不涉及持久化
    if (this.requiresPersistence(navigation)) {
      throw new Error('Navigation operations must not require persistence');
    }
    
    return true;
  }
  
  /**
   * 判断操作是否需要持久化
   */
  private static requiresPersistence(operations: any): boolean {
    // 检查是否包含异步操作（通常表示数据库/API调用）
    const hasAsync = this.containsAsyncFunction(operations);
    
    // 检查是否包含明确的持久化标识
    const hasPersistenceKeywords = ['save', 'submit', 'create', 'update', 'delete', 'sync', 'mutations'];
    const keys = this.extractAllKeys(operations);
    
    return hasAsync || keys.some(key => 
      hasPersistenceKeywords.some(keyword => key.toLowerCase().includes(keyword))
    );
  }
  
  private static containsAsyncFunction(obj: any): boolean {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'function' && value.constructor.name === 'AsyncFunction') {
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (this.containsAsyncFunction(value)) {
          return true;
        }
      }
    }
    return false;
  }
  
  private static extractAllKeys(obj: any): string[] {
    const keys: string[] = [];
    
    const extract = (current: any): void => {
      for (const key in current) {
        keys.push(key);
        if (typeof current[key] === 'object' && current[key] !== null) {
          extract(current[key]);
        }
      }
    };
    
    extract(obj);
    return keys;
  }
}

/**
 * 预定义的导航模式
 */
export const navigationPresets = {
  // 标签页导航
  tabs: {
    viewState: {
      current: 'tab1',
      available: ['tab1', 'tab2', 'tab3']
    }
  },
  
  // 列表选择
  listSelection: {
    selection: {
      selected: null,
      hover: null,
      focus: null
    }
  },
  
  // 树形展开
  treeExpansion: {
    expansion: {
      expanded: new Set<string>(),
      toggle: (id: string) => {}
    }
  },
  
  // 表格显示
  tableDisplay: {
    display: {
      filter: '',
      sort: { field: 'id', order: 'asc' as const },
      page: 1,
      pageSize: 10
    }
  },
  
  // 加载状态
  loadingFeedback: {
    feedback: {
      loading: false,
      error: null,
      message: null
    }
  }
} as const;

export type NavigationPreset = keyof typeof navigationPresets;