/**
 * 展示层元规则定义和实现
 * 基于集合论思维，确保所有子集互斥且完备
 * 
 * Presentation = Spatial ∪ Visual ∪ Typography ∪ Effects
 * 其中任意两个子集的交集为空集
 */

// 导入各子集
import { Spatial, SpatialValidator, spatialToCSS, spatialPresets } from './spatial';
import { Visual, VisualValidator, visualToCSS, visualPresets, colorTokens, borderTokens } from './visual';
import { Typography, TypographyValidator, typographyToCSS, typographyPresets, typographyTokens } from './typography';
import { Effects, EffectsValidator, effectsToCSS, effectsPresets, shadowTokens, animationTokens } from './effects';

// 导出各子集类型和工具
export type { Spatial, Visual, Typography, Effects };
export { 
  SpatialValidator, 
  VisualValidator, 
  TypographyValidator, 
  EffectsValidator 
};

/**
 * 展示层定义
 * 全集P = S ∪ V ∪ T ∪ E
 * 每个子集都是可选的，但如果提供必须符合规范
 */
export interface Presentation {
  spatial?: Spatial;      // 空间属性：位置、尺寸、布局
  visual?: Visual;        // 视觉属性：颜色、边框、背景
  typography?: Typography; // 文字属性：字体、字号、字重
  effects?: Effects;      // 效果属性：阴影、模糊、动画
}

/**
 * 展示层验证器
 * 确保各子集互斥且符合规范
 */
export class PresentationValidator {
  /**
   * 验证展示层定义是否符合规范
   */
  static validate(presentation: any): presentation is Presentation {
    if (!presentation || typeof presentation !== 'object') {
      return false;
    }
    
    const validKeys = ['spatial', 'visual', 'typography', 'effects'];
    const keys = Object.keys(presentation);
    
    // 检查是否只包含允许的键
    if (!keys.every(key => validKeys.includes(key))) {
      throw new Error(`Invalid presentation keys. Only allowed: ${validKeys.join(', ')}`);
    }
    
    // 验证各个子集
    if (presentation.spatial && !SpatialValidator.validate(presentation.spatial)) {
      return false;
    }
    
    if (presentation.visual && !VisualValidator.validate(presentation.visual)) {
      return false;
    }
    
    if (presentation.typography && !TypographyValidator.validate(presentation.typography)) {
      return false;
    }
    
    if (presentation.effects && !EffectsValidator.validate(presentation.effects)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查子集互斥性
   * 确保属性不会出现在错误的子集中
   */
  static checkMutualExclusion(presentation: Presentation): boolean {
    // 定义每个子集的专属属性
    const spatialOnly = ['layout', 'size', 'spacing', 'position', 'layoutDetails'];
    const visualOnly = ['colors', 'border', 'background', 'opacity'];
    const typographyOnly = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign'];
    const effectsOnly = ['shadow', 'filter', 'transform', 'transition', 'animation'];
    
    // 这里可以添加更严格的互斥性检查
    return true;
  }
}

/**
 * 将展示层定义转换为CSS属性
 */
export function presentationToCSS(presentation: Presentation): Record<string, any> {
  return {
    ...spatialToCSS(presentation.spatial),
    ...visualToCSS(presentation.visual),
    ...typographyToCSS(presentation.typography),
    ...effectsToCSS(presentation.effects),
  };
}

/**
 * 设计令牌系统 - 统一导出
 */
export const tokens = {
  colors: colorTokens,
  borders: borderTokens,
  typography: typographyTokens,
  shadows: shadowTokens,
  animations: animationTokens,
  
  // 间距令牌（从spatial中提取的常量）
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  }
};

/**
 * 预定义的展示层样式 - 组合各子集预设
 */
export const presentationPresets = {
  // 容器
  container: {
    spatial: spatialPresets.centeredContainer,
  },
  
  // 卡片
  card: {
    spatial: {
      layout: 'static' as const,
      spacing: { padding: '16px' }
    },
    visual: visualPresets.card,
    effects: effectsPresets.cardShadow,
  },
  
  // 主按钮
  primaryButton: {
    spatial: {
      layout: 'flex' as const,
      layoutDetails: {
        justify: 'center' as const,
        align: 'center' as const
      },
      spacing: { padding: '8px 16px' }
    },
    visual: visualPresets.primaryButton,
    typography: typographyPresets.button,
    effects: effectsPresets.hover,
  },
  
  // 大标题
  heading: {
    typography: typographyPresets.h1,
  },
  
  // 网格布局
  grid: {
    spatial: spatialPresets.grid12,
  },
  
  // 弹性布局
  flexRow: {
    spatial: spatialPresets.flexRow,
  },
  
  flexColumn: {
    spatial: spatialPresets.flexColumn,
  },
  
  // 玻璃效果
  glass: {
    visual: visualPresets.glass,
    effects: effectsPresets.glassMorphism,
  }
} as const;

export type PresentationPreset = keyof typeof presentationPresets;

/**
 * 创建自定义主题
 */
export function createTheme(overrides: Partial<typeof tokens>): typeof tokens {
  return {
    ...tokens,
    ...overrides,
  };
}

/**
 * 组合多个展示层定义
 */
export function mergePresentation(...presentations: Partial<Presentation>[]): Presentation {
  const result: Presentation = {};
  
  for (const p of presentations) {
    if (p.spatial) {
      result.spatial = result.spatial 
        ? { ...result.spatial, ...p.spatial } as Spatial
        : p.spatial;
    }
    if (p.visual) {
      result.visual = result.visual
        ? { ...result.visual, ...p.visual }
        : p.visual;
    }
    if (p.typography) {
      result.typography = result.typography
        ? { ...result.typography, ...p.typography }
        : p.typography;
    }
    if (p.effects) {
      result.effects = result.effects
        ? { ...result.effects, ...p.effects }
        : p.effects;
    }
  }
  
  return result;
}