/**
 * 效果属性 E - 定义特殊视觉效果
 * 包含且仅包含：阴影、滤镜、变换、过渡
 * 
 * E ∩ S = ∅, E ∩ V = ∅, E ∩ T = ∅
 */

/**
 * 效果属性定义
 */
export interface Effects {
  // 阴影
  shadow?: string;
  boxShadow?: string;  // 盒阴影的完整写法
  
  // 滤镜
  filter?: {
    blur?: string;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
    saturate?: number;
    sepia?: number;
    hueRotate?: string;
    dropShadow?: string;
    invert?: number;
  };
  
  // 变换
  transform?: {
    scale?: number | { x?: number; y?: number; z?: number };
    rotate?: string | { x?: string; y?: string; z?: string };
    translate?: { x?: string; y?: string; z?: string };
    skew?: { x?: string; y?: string };
    perspective?: string;
    matrix?: string;
  };
  transformOrigin?: string;
  transformStyle?: 'flat' | 'preserve-3d';
  backfaceVisibility?: 'visible' | 'hidden';
  perspective?: string;
  perspectiveOrigin?: string;
  
  // 过渡动画
  transition?: {
    property: string | string[];
    duration: string;
    easing?: string;
    delay?: string;
  };
  
  // CSS动画
  animation?: {
    name: string;
    duration: string;
    easing?: string;
    delay?: string;
    iteration?: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
    playState?: 'running' | 'paused';
  };
  
  // 交互反馈（鼠标、指针、选择）
  cursor?: 'auto' | 'default' | 'pointer' | 'wait' | 'text' | 'move' | 'not-allowed' | 'grab' | 'grabbing' | 'crosshair' | 'help' | 'progress' | 'zoom-in' | 'zoom-out' | string;
  pointerEvents?: 'auto' | 'none' | 'visiblePainted' | 'visibleFill' | 'visibleStroke' | 'visible' | 'painted' | 'fill' | 'stroke' | 'all';
  userSelect?: 'auto' | 'none' | 'text' | 'all' | 'contain';
  touchAction?: 'auto' | 'none' | 'pan-x' | 'pan-y' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation';
  
  // 性能优化
  willChange?: 'auto' | 'scroll-position' | 'contents' | string;
  contain?: 'none' | 'strict' | 'content' | 'size' | 'layout' | 'style' | 'paint';
  contentVisibility?: 'auto' | 'hidden' | 'visible';
  
  // 其他效果
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  appearance?: 'none' | 'auto' | 'button' | 'textfield' | 'searchfield' | 'textarea' | 'push-button' | 'button-bevel' | 'slider-horizontal' | 'checkbox' | 'radio' | 'square-button' | 'menulist' | 'listbox' | 'meter' | 'progress-bar';
}

/**
 * 效果属性验证器
 */
export class EffectsValidator {
  static validate(effects: any): effects is Effects {
    if (!effects || typeof effects !== 'object') {
      return true; // 效果属性是可选的
    }
    
    const validKeys = [
      'shadow', 'boxShadow', 'filter', 'transform', 'transformOrigin', 'transformStyle',
      'backfaceVisibility', 'perspective', 'perspectiveOrigin', 'transition', 'animation',
      'cursor', 'pointerEvents', 'userSelect', 'touchAction',
      'willChange', 'contain', 'contentVisibility', 'resize', 'appearance'
    ];
    const keys = Object.keys(effects);
    
    const invalidKeys = keys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid effects keys: ${invalidKeys.join(', ')}. Only allowed: ${validKeys.join(', ')}`);
    }
    
    // 验证滤镜值范围
    if (effects.filter) {
      const filter = effects.filter;
      if (filter.brightness !== undefined && (filter.brightness < 0 || filter.brightness > 2)) {
        throw new Error('Brightness must be between 0 and 2');
      }
      if (filter.contrast !== undefined && filter.contrast < 0) {
        throw new Error('Contrast must be non-negative');
      }
      if (filter.grayscale !== undefined && (filter.grayscale < 0 || filter.grayscale > 1)) {
        throw new Error('Grayscale must be between 0 and 1');
      }
      if (filter.saturate !== undefined && filter.saturate < 0) {
        throw new Error('Saturate must be non-negative');
      }
      if (filter.sepia !== undefined && (filter.sepia < 0 || filter.sepia > 1)) {
        throw new Error('Sepia must be between 0 and 1');
      }
    }
    
    // 验证动画方向
    if (effects.animation?.direction) {
      const validDirections = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
      if (!validDirections.includes(effects.animation.direction)) {
        throw new Error(`Invalid animation direction: ${effects.animation.direction}`);
      }
    }
    
    // 验证动画填充模式
    if (effects.animation?.fillMode) {
      const validFillModes = ['none', 'forwards', 'backwards', 'both'];
      if (!validFillModes.includes(effects.animation.fillMode)) {
        throw new Error(`Invalid animation fill mode: ${effects.animation.fillMode}`);
      }
    }
    
    return true;
  }
}

/**
 * 将效果属性转换为CSS
 */
export function effectsToCSS(effects?: Effects): Record<string, any> {
  if (!effects) return {};
  
  const css: Record<string, any> = {};
  const { 
    shadow, boxShadow, filter, transform, transformOrigin, transformStyle,
    backfaceVisibility, perspective, perspectiveOrigin, transition, animation,
    cursor, pointerEvents, userSelect, touchAction,
    willChange, contain, contentVisibility, resize, appearance
  } = effects;
  
  // 处理阴影
  if (shadow || boxShadow) {
    css.boxShadow = boxShadow || shadow;
  }
  
  // 处理滤镜
  if (filter) {
    const filters = [];
    if (filter.blur) filters.push(`blur(${filter.blur})`);
    if (filter.brightness !== undefined) filters.push(`brightness(${filter.brightness})`);
    if (filter.contrast !== undefined) filters.push(`contrast(${filter.contrast})`);
    if (filter.grayscale !== undefined) filters.push(`grayscale(${filter.grayscale})`);
    if (filter.saturate !== undefined) filters.push(`saturate(${filter.saturate})`);
    if (filter.sepia !== undefined) filters.push(`sepia(${filter.sepia})`);
    if (filter.hueRotate) filters.push(`hue-rotate(${filter.hueRotate})`);
    if (filter.dropShadow) filters.push(`drop-shadow(${filter.dropShadow})`);
    if (filter.invert !== undefined) filters.push(`invert(${filter.invert})`);
    
    if (filters.length > 0) {
      css.filter = filters.join(' ');
    }
  }
  
  // 处理变换
  if (transform) {
    const transforms = [];
    
    if (transform.scale !== undefined) {
      if (typeof transform.scale === 'number') {
        transforms.push(`scale(${transform.scale})`);
      } else {
        if (transform.scale.z !== undefined) {
          transforms.push(`scale3d(${transform.scale.x ?? 1}, ${transform.scale.y ?? 1}, ${transform.scale.z})`);
        } else {
          transforms.push(`scale(${transform.scale.x ?? 1}, ${transform.scale.y ?? 1})`);
        }
      }
    }
    
    if (transform.rotate) {
      if (typeof transform.rotate === 'string') {
        transforms.push(`rotate(${transform.rotate})`);
      } else {
        if (transform.rotate.x) transforms.push(`rotateX(${transform.rotate.x})`);
        if (transform.rotate.y) transforms.push(`rotateY(${transform.rotate.y})`);
        if (transform.rotate.z) transforms.push(`rotateZ(${transform.rotate.z})`);
      }
    }
    
    if (transform.translate) {
      if (transform.translate.z) {
        transforms.push(`translate3d(${transform.translate.x || '0'}, ${transform.translate.y || '0'}, ${transform.translate.z})`);
      } else {
        transforms.push(`translate(${transform.translate.x || '0'}, ${transform.translate.y || '0'})`);
      }
    }
    
    if (transform.skew) {
      transforms.push(`skew(${transform.skew.x || '0'}, ${transform.skew.y || '0'})`);
    }
    
    if (transform.perspective) {
      transforms.push(`perspective(${transform.perspective})`);
    }
    
    if (transform.matrix) {
      transforms.push(`matrix(${transform.matrix})`);
    }
    
    if (transforms.length > 0) {
      css.transform = transforms.join(' ');
    }
  }
  
  // 处理变换相关属性
  if (transformOrigin) css.transformOrigin = transformOrigin;
  if (transformStyle) css.transformStyle = transformStyle;
  if (backfaceVisibility) css.backfaceVisibility = backfaceVisibility;
  if (perspective) css.perspective = perspective;
  if (perspectiveOrigin) css.perspectiveOrigin = perspectiveOrigin;
  
  // 处理过渡
  if (transition) {
    const props = Array.isArray(transition.property) ? transition.property : [transition.property];
    css.transition = props.map(prop => 
      `${prop} ${transition.duration} ${transition.easing || 'ease'} ${transition.delay || '0s'}`
    ).join(', ');
  }
  
  // 处理动画
  if (animation) {
    const parts = [
      animation.name,
      animation.duration,
      animation.easing || 'ease',
      animation.delay || '0s',
      animation.iteration === 'infinite' ? 'infinite' : (animation.iteration || 1),
      animation.direction || 'normal',
      animation.fillMode || 'none'
    ];
    css.animation = parts.join(' ');
    if (animation.playState) css.animationPlayState = animation.playState;
  }
  
  // 处理交互反馈
  if (cursor) css.cursor = cursor;
  if (pointerEvents) css.pointerEvents = pointerEvents;
  if (userSelect) css.userSelect = userSelect;
  if (touchAction) css.touchAction = touchAction;
  
  // 处理性能优化
  if (willChange) css.willChange = willChange;
  if (contain) css.contain = contain;
  if (contentVisibility) css.contentVisibility = contentVisibility;
  
  // 处理其他效果
  if (resize) css.resize = resize;
  if (appearance) css.appearance = appearance;
  
  return css;
}

/**
 * 阴影令牌系统
 */
export const shadowTokens = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.12)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
};

/**
 * 动画令牌系统
 */
export const animationTokens = {
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
};

/**
 * 效果属性预设
 */
export const effectsPresets = {
  // 卡片阴影
  cardShadow: {
    shadow: shadowTokens.md,
  },
  
  // 悬停效果
  hover: {
    transform: { scale: 1.05 },
    transition: {
      property: ['transform', 'box-shadow'],
      duration: animationTokens.duration.fast,
      easing: animationTokens.easing.smooth,
    }
  },
  
  // 点击效果
  active: {
    transform: { scale: 0.95 },
    transition: {
      property: 'transform',
      duration: animationTokens.duration.fast,
    }
  },
  
  // 淡入
  fadeIn: {
    animation: {
      name: 'fadeIn',
      duration: animationTokens.duration.normal,
      easing: animationTokens.easing.easeOut,
    }
  },
  
  // 滑入
  slideIn: {
    animation: {
      name: 'slideIn',
      duration: animationTokens.duration.slow,
      easing: animationTokens.easing.smooth,
    }
  },
  
  // 模糊背景
  blurBackground: {
    filter: { blur: '8px' },
  },
  
  // 玻璃效果
  glassMorphism: {
    filter: { blur: '10px', saturate: 1.8 },
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // 3D旋转
  rotate3d: {
    transform: { rotate: '15deg' },
    transition: {
      property: 'transform',
      duration: animationTokens.duration.slow,
      easing: animationTokens.easing.smooth,
    }
  }
} as const;