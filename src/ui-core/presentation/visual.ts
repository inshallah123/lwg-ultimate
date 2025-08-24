/**
 * 视觉属性 V - 定义元素的视觉外观
 * 包含且仅包含：颜色、边框、背景、透明度
 * 
 * V ∩ S = ∅, V ∩ T = ∅, V ∩ E = ∅
 */

/**
 * 视觉属性定义
 */
export interface Visual {
  // 颜色
  colors?: {
    text?: string;
    background?: string;
    border?: string;
  };
  
  // 边框
  border?: {
    width?: string;
    style?: 'solid' | 'dashed' | 'dotted' | 'none';
    radius?: string;
  };
  
  // 背景
  background?: {
    color?: string;
    gradient?: string;
    image?: string;
    opacity?: number;
  };
  
  // 基础透明度
  opacity?: number;
}

/**
 * 视觉属性验证器
 */
export class VisualValidator {
  static validate(visual: any): visual is Visual {
    if (!visual || typeof visual !== 'object') {
      return true; // 视觉属性是可选的
    }
    
    const validKeys = ['colors', 'border', 'background', 'opacity'];
    const keys = Object.keys(visual);
    
    const invalidKeys = keys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid visual keys: ${invalidKeys.join(', ')}. Only allowed: ${validKeys.join(', ')}`);
    }
    
    // 验证边框样式
    if (visual.border?.style) {
      const validStyles = ['solid', 'dashed', 'dotted', 'none'];
      if (!validStyles.includes(visual.border.style)) {
        throw new Error(`Invalid border style: ${visual.border.style}`);
      }
    }
    
    // 验证透明度范围
    if (visual.opacity !== undefined) {
      if (typeof visual.opacity !== 'number' || visual.opacity < 0 || visual.opacity > 1) {
        throw new Error('Opacity must be a number between 0 and 1');
      }
    }
    
    if (visual.background?.opacity !== undefined) {
      if (typeof visual.background.opacity !== 'number' || 
          visual.background.opacity < 0 || 
          visual.background.opacity > 1) {
        throw new Error('Background opacity must be a number between 0 and 1');
      }
    }
    
    return true;
  }
}

/**
 * 将视觉属性转换为CSS
 */
export function visualToCSS(visual?: Visual): Record<string, any> {
  if (!visual) return {};
  
  const css: Record<string, any> = {};
  const { colors, border, background, opacity } = visual;
  
  // 处理颜色
  if (colors) {
    if (colors.text) css.color = colors.text;
    if (colors.background) css.backgroundColor = colors.background;
    if (colors.border) css.borderColor = colors.border;
  }
  
  // 处理边框
  if (border) {
    if (border.width) css.borderWidth = border.width;
    if (border.style) css.borderStyle = border.style;
    if (border.radius) css.borderRadius = border.radius;
  }
  
  // 处理背景
  if (background) {
    if (background.gradient) {
      css.background = background.gradient;
    } else if (background.color) {
      css.backgroundColor = background.color;
    }
    if (background.image) {
      css.backgroundImage = `url(${background.image})`;
    }
    if (background.opacity !== undefined) {
      css.backgroundOpacity = background.opacity;
    }
  }
  
  // 处理透明度
  if (opacity !== undefined) {
    css.opacity = opacity;
  }
  
  return css;
}

/**
 * 颜色令牌系统
 */
export const colorTokens = {
  light: {
    primary: '#5B8DBE',
    secondary: '#7BA7D1',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#2C3E50',
    border: '#E2E8F0',
    error: '#E15554',
    warning: '#F39C4D',
    success: '#52A373',
    info: '#5B8DBE',
  },
  dark: {
    primary: '#ef4444',
    secondary: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    border: 'rgba(255, 255, 255, 0.08)',
    error: '#E15554',
    warning: '#F39C4D',
    success: '#52A373',
    info: '#ef4444',
  }
};

/**
 * 边框令牌系统
 */
export const borderTokens = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  }
};

/**
 * 视觉属性预设
 */
export const visualPresets = {
  // 卡片样式
  card: {
    colors: { background: '#ffffff' },
    border: { 
      width: '1px', 
      style: 'solid' as const, 
      radius: '8px' 
    }
  },
  
  // 主按钮样式
  primaryButton: {
    colors: { 
      background: colorTokens.light.primary,
      text: '#ffffff' 
    },
    border: { radius: '8px' }
  },
  
  // 边框按钮样式
  outlineButton: {
    colors: { 
      text: colorTokens.light.primary,
      border: colorTokens.light.primary 
    },
    border: { 
      width: '1px', 
      style: 'solid' as const, 
      radius: '8px' 
    },
    background: { color: 'transparent' }
  },
  
  // 玻璃效果
  glass: {
    background: {
      gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))'
    },
    opacity: 0.95
  },
  
  // 渐变背景
  gradient: {
    background: {
      gradient: 'linear-gradient(135deg, #5B8DBE, #7BA7D1)'
    }
  }
} as const;