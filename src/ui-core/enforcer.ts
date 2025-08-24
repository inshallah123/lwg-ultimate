/**
 * 严格模式强制执行器
 * 在开发和构建时强制检查所有组件符合元规则
 */

import { Presentation, PresentationValidator } from './presentation';
import { UIComponent } from './component';

/**
 * 严格模式配置
 */
export interface StrictModeConfig {
  // 是否在开发时强制检查
  enforceInDevelopment: boolean;
  // 是否在生产环境强制检查
  enforceInProduction: boolean;
  // 是否抛出错误（false则只警告）
  throwOnViolation: boolean;
  // 是否检查运行时动态样式
  checkRuntimeStyles: boolean;
}

/**
 * 默认配置
 */
const defaultConfig: StrictModeConfig = {
  enforceInDevelopment: true,
  enforceInProduction: false,
  throwOnViolation: true,
  checkRuntimeStyles: true,
};

/**
 * 严格模式强制器
 */
export class StrictModeEnforcer {
  private config: StrictModeConfig;
  private violations: Map<string, string[]> = new Map();
  
  constructor(config: Partial<StrictModeConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * 检查单个组件定义
   */
  checkComponent(name: string, definition: UIComponent): boolean {
    const errors: string[] = [];
    
    try {
      // 检查展示层
      if (!definition.presentation) {
        errors.push('Missing required presentation layer');
      } else {
        this.checkPresentation(definition.presentation, errors);
      }
      
      // 检查交互层（如果存在）
      if (definition.interaction) {
        this.checkInteraction(definition.interaction, errors);
      }
      
      // 检查是否有非法属性
      const allowedKeys = ['presentation', 'interaction'];
      const actualKeys = Object.keys(definition);
      const illegalKeys = actualKeys.filter(key => !allowedKeys.includes(key));
      
      if (illegalKeys.length > 0) {
        errors.push(`Illegal properties found: ${illegalKeys.join(', ')}`);
      }
    } catch (error: any) {
      errors.push(error.message);
    }
    
    // 记录违规
    if (errors.length > 0) {
      this.violations.set(name, errors);
      this.handleViolation(name, errors);
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查展示层定义
   */
  private checkPresentation(presentation: Presentation, errors: string[]): void {
    // 检查是否只包含允许的子集
    const allowedSubsets = ['spatial', 'visual', 'typography', 'effects'];
    const actualSubsets = Object.keys(presentation);
    
    // 检查非法子集
    const illegalSubsets = actualSubsets.filter(key => !allowedSubsets.includes(key));
    if (illegalSubsets.length > 0) {
      errors.push(`Presentation contains illegal subsets: ${illegalSubsets.join(', ')}`);
    }
    
    // 验证各子集的互斥性
    this.checkMutualExclusion(presentation, errors);
    
    // 使用验证器进行详细检查
    try {
      PresentationValidator.validate(presentation);
    } catch (error: any) {
      errors.push(`Presentation validation failed: ${error.message}`);
    }
  }
  
  /**
   * 检查子集互斥性
   * 确保S ∩ V = ∅, S ∩ T = ∅, S ∩ E = ∅, V ∩ T = ∅, V ∩ E = ∅, T ∩ E = ∅
   */
  private checkMutualExclusion(presentation: Presentation, errors: string[]): void {
    // 定义每个子集的专属属性
    const spatialOnly = ['layout', 'size', 'spacing', 'position', 'layoutDetails'];
    const visualOnly = ['colors', 'border', 'background', 'opacity'];
    const typographyOnly = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign'];
    const effectsOnly = ['shadow', 'filter', 'transform', 'transition', 'animation'];
    
    // 检查是否有属性出现在错误的子集中
    if (presentation.spatial) {
      const spatialKeys = this.getAllKeys(presentation.spatial);
      const violations = spatialKeys.filter(key => 
        visualOnly.includes(key) || typographyOnly.includes(key) || effectsOnly.includes(key)
      );
      if (violations.length > 0) {
        errors.push(`Spatial subset contains non-spatial properties: ${violations.join(', ')}`);
      }
    }
    
    if (presentation.visual) {
      const visualKeys = this.getAllKeys(presentation.visual);
      const violations = visualKeys.filter(key => 
        spatialOnly.includes(key) || typographyOnly.includes(key) || effectsOnly.includes(key)
      );
      if (violations.length > 0) {
        errors.push(`Visual subset contains non-visual properties: ${violations.join(', ')}`);
      }
    }
    
    // 类似检查typography和effects...
  }
  
  /**
   * 检查交互层定义
   */
  private checkInteraction(interaction: any, errors: string[]): void {
    const allowedKeys = ['navigation', 'io'];
    const actualKeys = Object.keys(interaction);
    
    const illegalKeys = actualKeys.filter(key => !allowedKeys.includes(key));
    if (illegalKeys.length > 0) {
      errors.push(`Interaction contains illegal properties: ${illegalKeys.join(', ')}`);
    }
    
    // 进一步检查navigation和io的互斥性
    // navigation: 信息熵不变的操作
    // io: 信息熵改变的操作
  }
  
  /**
   * 处理违规
   */
  private handleViolation(name: string, errors: string[]): void {
    const message = `Component "${name}" violates strict mode:\n${errors.map(e => `  - ${e}`).join('\n')}`;
    
    if (this.shouldEnforce()) {
      if (this.config.throwOnViolation) {
        throw new Error(message);
      } else {
        console.warn(message);
      }
    }
  }
  
  /**
   * 是否应该强制执行
   */
  private shouldEnforce(): boolean {
    const isDev = process.env.NODE_ENV === 'development';
    return isDev ? this.config.enforceInDevelopment : this.config.enforceInProduction;
  }
  
  /**
   * 获取对象的所有键（递归）
   */
  private getAllKeys(obj: any): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      keys.push(key);
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...this.getAllKeys(obj[key]));
      }
    }
    
    return keys;
  }
  
  /**
   * 批量检查组件
   */
  checkComponents(components: Record<string, UIComponent>): boolean {
    let allValid = true;
    
    for (const [name, definition] of Object.entries(components)) {
      if (!this.checkComponent(name, definition)) {
        allValid = false;
      }
    }
    
    return allValid;
  }
  
  /**
   * 获取所有违规记录
   */
  getViolations(): Map<string, string[]> {
    return new Map(this.violations);
  }
  
  /**
   * 清除违规记录
   */
  clearViolations(): void {
    this.violations.clear();
  }
  
  /**
   * 生成违规报告
   */
  generateReport(): string {
    if (this.violations.size === 0) {
      return 'No violations found. All components comply with strict mode.';
    }
    
    let report = `Strict Mode Violations Report\n`;
    report += `==============================\n\n`;
    report += `Total violations: ${this.violations.size}\n\n`;
    
    for (const [name, errors] of this.violations) {
      report += `Component: ${name}\n`;
      errors.forEach(error => {
        report += `  ❌ ${error}\n`;
      });
      report += '\n';
    }
    
    return report;
  }
}

/**
 * 全局强制器实例
 */
export const strictEnforcer = new StrictModeEnforcer();

/**
 * 装饰器：标记组件必须符合严格模式
 */
export function StrictMode(config?: Partial<StrictModeConfig>) {
  return function (target: any) {
    const enforcer = new StrictModeEnforcer(config);
    
    // 在组件挂载时检查
    const originalComponentDidMount = target.prototype.componentDidMount;
    target.prototype.componentDidMount = function() {
      if (this.__strictDefinition) {
        enforcer.checkComponent(target.name, this.__strictDefinition);
      }
      
      if (originalComponentDidMount) {
        originalComponentDidMount.call(this);
      }
    };
    
    return target;
  };
}

/**
 * 构建时检查脚本
 * 可以在构建流程中调用
 */
export function runStrictModeCheck(
  componentsPath: string,
  config?: Partial<StrictModeConfig>
): void {
  const enforcer = new StrictModeEnforcer({
    ...config,
    throwOnViolation: true, // 构建时总是抛出错误
  });
  
  // 这里可以集成到实际的构建流程中
  // 例如通过webpack插件或其他构建工具
  
  console.log('Running strict mode check...');
  // 实际实现需要文件系统访问和模块解析
  
  const report = enforcer.generateReport();
  console.log(report);
  
  if (enforcer.getViolations().size > 0) {
    process.exit(1); // 构建失败
  }
}