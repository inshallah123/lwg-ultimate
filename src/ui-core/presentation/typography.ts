/**
 * 文字属性 T - 定义文本的排版
 * 包含且仅包含：字体相关属性
 * 
 * T ∩ S = ∅, T ∩ V = ∅, T ∩ E = ∅
 */

/**
 * 文字属性定义
 */
export interface Typography {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  lineHeight?: number | string;
  letterSpacing?: string;
  wordSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'full-width';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through' | 'underline overline';
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
  textDecorationColor?: string;
  textIndent?: string;
  textOverflow?: 'clip' | 'ellipsis' | string;
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
  textShadow?: string;
  writingMode?: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
}

/**
 * 文字属性验证器
 */
export class TypographyValidator {
  static validate(typography: any): typography is Typography {
    if (!typography || typeof typography !== 'object') {
      return true; // 文字属性是可选的
    }
    
    const validKeys = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
      'letterSpacing', 'wordSpacing', 'textAlign', 'textTransform', 'textDecoration',
      'textDecorationStyle', 'textDecorationColor', 'textIndent', 'textOverflow',
      'wordBreak', 'whiteSpace', 'textShadow', 'writingMode'
    ];
    const keys = Object.keys(typography);
    
    const invalidKeys = keys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid typography keys: ${invalidKeys.join(', ')}. Only allowed: ${validKeys.join(', ')}`);
    }
    
    // 验证文本对齐
    if (typography.textAlign) {
      const validAligns = ['left', 'center', 'right', 'justify'];
      if (!validAligns.includes(typography.textAlign)) {
        throw new Error(`Invalid text align: ${typography.textAlign}`);
      }
    }
    
    // 验证文本转换
    if (typography.textTransform) {
      const validTransforms = ['none', 'uppercase', 'lowercase', 'capitalize'];
      if (!validTransforms.includes(typography.textTransform)) {
        throw new Error(`Invalid text transform: ${typography.textTransform}`);
      }
    }
    
    // 验证文本装饰
    if (typography.textDecoration) {
      const validDecorations = ['none', 'underline', 'line-through'];
      if (!validDecorations.includes(typography.textDecoration)) {
        throw new Error(`Invalid text decoration: ${typography.textDecoration}`);
      }
    }
    
    // 验证字重
    if (typography.fontWeight !== undefined) {
      if (typeof typography.fontWeight === 'number') {
        if (typography.fontWeight < 100 || typography.fontWeight > 900) {
          throw new Error('Font weight must be between 100 and 900');
        }
      } else if (typeof typography.fontWeight === 'string') {
        const validWeights = ['normal', 'bold', 'lighter', 'bolder'];
        if (!validWeights.includes(typography.fontWeight) && 
            !/^\d{3}$/.test(typography.fontWeight)) {
          throw new Error(`Invalid font weight: ${typography.fontWeight}`);
        }
      }
    }
    
    return true;
  }
}

/**
 * 将文字属性转换为CSS
 */
export function typographyToCSS(typography?: Typography): Record<string, any> {
  if (!typography) return {};
  
  // 直接映射所有属性到CSS
  return { ...typography };
}

/**
 * 字体令牌系统
 */
export const typographyTokens = {
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
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.8,
    loose: 2,
  },
  
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.04em',
    widest: '0.08em',
  }
};

/**
 * 文字属性预设
 */
export const typographyPresets = {
  // 大标题
  h1: {
    fontSize: typographyTokens.fontSize['3xl'],
    fontWeight: typographyTokens.fontWeight.bold,
    lineHeight: typographyTokens.lineHeight.tight,
    letterSpacing: typographyTokens.letterSpacing.tight,
  },
  
  // 中标题
  h2: {
    fontSize: typographyTokens.fontSize['2xl'],
    fontWeight: typographyTokens.fontWeight.semibold,
    lineHeight: typographyTokens.lineHeight.tight,
  },
  
  // 小标题
  h3: {
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.semibold,
    lineHeight: typographyTokens.lineHeight.snug,
  },
  
  // 正文
  body: {
    fontSize: typographyTokens.fontSize.md,
    fontWeight: typographyTokens.fontWeight.regular,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  
  // 小字
  caption: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.regular,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  
  // 按钮文字
  button: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.medium,
    letterSpacing: typographyTokens.letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
  
  // 代码
  code: {
    fontFamily: typographyTokens.fontFamily.mono,
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.regular,
  },
  
  // 强调
  emphasis: {
    fontWeight: typographyTokens.fontWeight.semibold,
    textDecoration: 'underline' as const,
  }
} as const;