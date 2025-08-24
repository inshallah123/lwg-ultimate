/**
 * UI-Core 统一入口
 * 基于展示(Presentation)与交互(Interaction)的二元分离架构
 * 交互进一步细分为导航(Navigation, 瞬态变化)和I/O(需持久化的状态变化)
 */

// 导出展示层
export * from './presentation';
export type { 
  Presentation,
  Spatial,
  Visual,
  Typography,
  Effects,
  PresentationPreset
} from './presentation';

// 导出导航层
export * from './navigation';
export type {
  Navigation,
  NavigationPreset
} from './navigation';

// 导出I/O层
export * from './io';
export type {
  IO,
  IOPreset
} from './io';

// 导出组件系统
export * from './component';
export type { UIComponent } from './component';

// 导出验证器
export * from './enforcer';


/**
 * UI组件完整定义
 * 必须且只能包含presentation和interaction
 */
export interface UIComponentDefinition {
  // 展示层 - 必须提供
  presentation: import('./presentation').Presentation;
  
  // 交互层 - 可选，但如果提供必须符合规范
  interaction?: {
    navigation?: import('./navigation').Navigation;
    io?: import('./io').IO;
  };
}

/**
 * 创建UI组件的便捷函数
 */
export function defineComponent(
  name: string,
  definition: UIComponentDefinition
): UIComponentDefinition {
  // 验证定义
  if (!definition.presentation) {
    throw new Error(`Component "${name}" must have a presentation layer`);
  }
  
  // 验证互斥性
  if (definition.interaction) {
    const { navigation, io } = definition.interaction;
    
    // 验证已在各自模块中完成
  }
  
  return definition;
}

/**
 * 操作分类器 - 基于持久化需求判断操作类型
 */
export function classifyOperation(operation: any): 'navigation' | 'io' {
  // 核心判据：操作结果是否需要持久化
  // Navigation: 瞬态变化，应用重启后不保留
  // I/O: 状态变化，需要持久化存储
  
  const requiresPersistence = 
    operation.type === 'mutation' ||
    operation.type === 'submit' ||
    operation.type === 'save' ||
    operation.affectsStorage === true;
  
  return requiresPersistence ? 'io' : 'navigation';
}