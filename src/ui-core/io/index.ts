/**
 * I/O层定义 - 系统状态变化
 * 判据：操作结果需要持久化到存储
 * 包含：数据CRUD、用户输入保存、配置更新
 */

/**
 * I/O操作 IO - 持久化操作
 * 产生需要保存的状态变化
 */
export interface IO {
  // 数据变更操作（需要持久化）
  mutations?: {
    create?: (data: any) => Promise<void>;
    update?: (id: string, data: any) => Promise<void>;
    delete?: (id: string) => Promise<void>;
    batch?: (operations: any[]) => Promise<void>;
  };
  
  // 表单输入（提交时持久化）
  forms?: {
    values: Record<string, any>;
    dirty: boolean;
    submit: () => Promise<void>;
    reset: () => void;
  };
  
  // 用户偏好设置（需要持久化）
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    settings?: Record<string, any>;
    save: () => Promise<void>;
  };
  
  // 数据同步操作
  sync?: {
    pull: () => Promise<void>;
    push: () => Promise<void>;
    conflict?: (local: any, remote: any) => any;
  };
}

/**
 * I/O验证器
 */
export class IOValidator {
  /**
   * 验证I/O操作定义
   */
  static validate(io: any): io is IO {
    if (!io || typeof io !== 'object') {
      return true; // I/O是可选的
    }
    
    const validKeys = ['mutations', 'forms', 'preferences', 'sync'];
    const keys = Object.keys(io);
    
    const invalidKeys = keys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid I/O keys: ${invalidKeys.join(', ')}`);
    }
    
    // 确保这些操作涉及持久化
    if (!this.requiresPersistence(io)) {
      throw new Error('I/O operations must require persistence');
    }
    
    return true;
  }
  
  /**
   * 判断操作是否需要持久化
   */
  private static requiresPersistence(operations: any): boolean {
    // I/O操作应该包含持久化特征
    const hasAsyncOperations = this.containsAsyncFunction(operations);
    const hasMutationOperations = operations.mutations !== undefined;
    const hasFormSubmit = operations.forms?.submit !== undefined;
    const hasPreferenceSave = operations.preferences?.save !== undefined;
    const hasSyncOperations = operations.sync !== undefined;
    
    return hasAsyncOperations || hasMutationOperations || hasFormSubmit || hasPreferenceSave || hasSyncOperations;
  }
  
  private static containsAsyncFunction(obj: any): boolean {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'function') {
        // 检查是否是异步函数
        const isAsync = value.constructor.name === 'AsyncFunction' ||
                       value.toString().includes('async');
        if (isAsync) return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (this.containsAsyncFunction(value)) {
          return true;
        }
      }
    }
    return false;
  }
}

/**
 * 操作分类器
 * 根据持久化判据自动分类操作
 */
export class OperationClassifier {
  /**
   * 分类单个操作
   */
  static classify(operation: {
    name: string;
    async: boolean;
    modifiesData: boolean;
    requiresStorage: boolean;
  }): 'navigation' | 'io' {
    // 需要存储的操作归为I/O
    if (operation.requiresStorage || operation.modifiesData) {
      return 'io';
    }
    
    // 异步操作通常涉及I/O（除非是UI动画等）
    if (operation.async && !this.isNavigationAsync(operation.name)) {
      return 'io';
    }
    
    // 其余归为导航
    return 'navigation';
  }
  
  /**
   * 判断是否为导航类异步操作
   */
  private static isNavigationAsync(name: string): boolean {
    // 某些异步操作仍属于导航（如动画、延迟加载UI）
    const navigationAsyncPatterns = [
      'animate', 'transition', 'delay', 'debounce', 'throttle',
      'loadView', 'prefetch', 'lazy'
    ];
    
    return navigationAsyncPatterns.some(pattern => 
      name.toLowerCase().includes(pattern)
    );
  }
  
  /**
   * 批量分类操作
   */
  static classifyBatch(operations: Array<{
    name: string;
    handler: Function;
  }>): {
    navigation: string[];
    io: string[];
  } {
    const result = {
      navigation: [] as string[],
      io: [] as string[]
    };
    
    for (const op of operations) {
      const classification = this.classify({
        name: op.name,
        async: op.handler.constructor.name === 'AsyncFunction',
        modifiesData: this.detectDataModification(op.handler),
        requiresStorage: this.detectStorageRequirement(op.handler)
      });
      
      result[classification].push(op.name);
    }
    
    return result;
  }
  
  /**
   * 检测函数是否修改数据
   */
  private static detectDataModification(fn: Function): boolean {
    const source = fn.toString();
    const modificationPatterns = [
      /\bset\w+\(/,
      /\bupdate\w+\(/,
      /\bdelete\w+\(/,
      /\bcreate\w+\(/,
      /\bsave\w+\(/,
      /\bmutate\w+\(/,
      /\.push\(/,
      /\.pop\(/,
      /\.splice\(/
    ];
    
    return modificationPatterns.some(pattern => pattern.test(source));
  }
  
  /**
   * 检测函数是否需要存储
   */
  private static detectStorageRequirement(fn: Function): boolean {
    const source = fn.toString();
    const storagePatterns = [
      /localStorage/,
      /sessionStorage/,
      /indexedDB/,
      /database/,
      /fetch|axios|http/,
      /\.save\(/,
      /\.persist\(/,
      /\.sync\(/
    ];
    
    return storagePatterns.some(pattern => pattern.test(source));
  }
}

/**
 * 预定义的I/O模式
 */
export const ioPresets = {
  // CRUD操作
  crud: {
    mutations: {
      create: async (data: any) => {},
      update: async (id: string, data: any) => {},
      delete: async (id: string) => {}
    }
  },
  
  // 表单提交
  formSubmit: {
    forms: {
      values: {},
      dirty: false,
      submit: async () => {},
      reset: () => {}
    }
  },
  
  // 用户设置
  userPreferences: {
    preferences: {
      theme: 'light' as const,
      language: 'en',
      settings: {},
      save: async () => {}
    }
  },
  
  // 数据同步
  dataSync: {
    sync: {
      pull: async () => {},
      push: async () => {}
    }
  }
} as const;

export type IOPreset = keyof typeof ioPresets;