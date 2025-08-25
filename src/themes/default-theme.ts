/**
 * 默认主题定义
 * 包含所有具体的样式值，与 ui-core 的抽象定义分离
 */

import { ThemeTokens, ThemeRegistry } from '../ui-core/presentation/theme-system';

/**
 * 默认主题令牌
 */
export const defaultTheme: ThemeTokens = {
  // 颜色系统
  colors: {
    // 主色
    primary: '#5B8DBE',
    secondary: '#7BA7D1',
    
    // 背景色
    background: '#F8FAFC',
    surface: '#FFFFFF',
    
    // 文本色
    text: '#2C3E50',
    textSecondary: '#64748B',
    buttonText: '#FFFFFF',
    
    // 边框色
    border: '#E2E8F0',
    
    // 状态色
    error: '#E15554',
    warning: '#F39C4D',
    success: '#52A373',
    info: '#5B8DBE',
    
    // 渐变
    primaryGradient: 'linear-gradient(135deg, #5B8DBE, #7BA7D1)',
  },
  
  // 间距系统
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    button: '8px 16px',
  },
  
  // 尺寸系统
  sizing: {
    container: '1280px',
    small: '640px',
    medium: '768px',
    large: '1024px',
    full: '100%',
  },
  
  // 文字系统
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
      serif: "'Georgia', 'Times New Roman', serif",
      mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
    },
    
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1.25rem',   // 20px
      xl: '1.5rem',    // 24px
      '2xl': '2rem',   // 32px
      '3xl': '2.5rem', // 40px
    },
    
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      normal: '400',
    },
    
    lineHeight: {
      tight: '1.2',
      snug: '1.4',
      normal: '1.6',
      relaxed: '1.8',
      loose: '2',
    },
    
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
      widest: '0.08em',
    }
  },
  
  // 边框系统
  borders: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
    }
  },
  
  // 阴影系统
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.12)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // 动画系统
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  // 断点系统（响应式设计）
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 层级系统
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  }
};

/**
 * 特殊效果令牌（扩展）
 */
const effectsTokens = {
  blur: {
    sm: '4px',
    md: '8px',
    lg: '10px',
    xl: '16px',
  },
  rotation: {
    default: '15deg',
    small: '5deg',
    large: '30deg',
  },
  glassMorphism: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
};

/**
 * 网格系统令牌（扩展）
 */
const gridTokens = {
  responsiveColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
};

/**
 * 暗色主题令牌
 */
export const darkTheme: ThemeTokens = {
  colors: {
    primary: '#ef4444',
    secondary: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    buttonText: '#ffffff',
    border: 'rgba(255, 255, 255, 0.08)',
    error: '#E15554',
    warning: '#F39C4D',
    success: '#52A373',
    info: '#ef4444',
    primaryGradient: 'linear-gradient(135deg, #ef4444, #f87171)',
  },
  
  // 继承其他系统（与默认主题相同）
  spacing: defaultTheme.spacing,
  sizing: defaultTheme.sizing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  
  // 阴影系统（暗色调整）
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
  
  animations: defaultTheme.animations,
  breakpoints: defaultTheme.breakpoints,
  zIndex: defaultTheme.zIndex,
};

/**
 * 扩展主题（包含额外令牌）
 * 使用类型断言来包含扩展属性
 */
export const extendedDefaultTheme = {
  ...defaultTheme,
  // 将扩展令牌合并到主题中
  effects: effectsTokens,
  grid: gridTokens,
} as ThemeTokens & { effects: typeof effectsTokens; grid: typeof gridTokens };

/**
 * 注册默认主题
 */
export function registerDefaultThemes(): void {
  ThemeRegistry.register('default', extendedDefaultTheme);
  ThemeRegistry.register('dark', darkTheme);
  ThemeRegistry.register('light', extendedDefaultTheme); // light 是 default 的别名
}

/**
 * 导出用于类型推断的主题类型
 */
export type DefaultTheme = typeof extendedDefaultTheme;
export type DarkTheme = typeof darkTheme;