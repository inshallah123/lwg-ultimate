/**
 * 空间属性 S - 定义元素在空间中的表现
 * 包含且仅包含：位置、尺寸、间距、布局
 * 
 * S ∩ V = ∅, S ∩ T = ∅, S ∩ E = ∅
 */

/**
 * 空间属性定义
 */
export interface Spatial {
  // 布局模式 - 互斥选择
  layout: 'flex' | 'grid' | 'absolute' | 'static' | 'fixed' | 'sticky' | 'relative';
  
  // 显示类型
  display?: 'block' | 'inline' | 'inline-block' | 'none' | 'flex' | 'grid' | 'inline-flex' | 'inline-grid' | 'table' | 'table-cell' | 'table-row';
  
  // 尺寸定义
  size?: {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    minWidth?: string;
    minHeight?: string;
  };
  
  // 间距定义
  spacing?: {
    padding?: string | { top?: string; right?: string; bottom?: string; left?: string };
    margin?: string | { top?: string; right?: string; bottom?: string; left?: string };
    gap?: string;
  };
  
  // 定位（在absolute/fixed/sticky/relative布局时有效）
  position?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    zIndex?: number;
    inset?: string; // 简写属性
  };
  
  // 溢出控制
  overflow?: {
    x?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
    y?: 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';
    scrollBehavior?: 'auto' | 'smooth';
    scrollSnapType?: string;
  };
  
  // 布局细节
  layoutDetails?: FlexDetails | GridDetails;
}

/**
 * 弹性布局细节
 */
export interface FlexDetails {
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
}

/**
 * 网格布局细节
 */
export interface GridDetails {
  columns?: string | number;
  rows?: string | number;
  areas?: string[][];
}

/**
 * 空间属性验证器
 */
export class SpatialValidator {
  static validate(spatial: any): spatial is Spatial {
    if (!spatial || typeof spatial !== 'object') {
      return false;
    }
    
    const validLayouts = ['flex', 'grid', 'absolute', 'static', 'fixed', 'sticky', 'relative'];
    if (!spatial.layout || !validLayouts.includes(spatial.layout)) {
      throw new Error(`Invalid layout: ${spatial.layout}. Must be one of: ${validLayouts.join(', ')}`);
    }
    
    // 验证布局细节与布局模式匹配
    if (spatial.layoutDetails) {
      if (spatial.layout === 'flex' && !this.isFlexDetails(spatial.layoutDetails)) {
        throw new Error('FlexDetails required for flex layout');
      }
      if (spatial.layout === 'grid' && !this.isGridDetails(spatial.layoutDetails)) {
        throw new Error('GridDetails required for grid layout');
      }
    }
    
    // 验证position在需要定位的布局时有效
    const positionLayouts = ['absolute', 'fixed', 'sticky', 'relative'];
    if (spatial.position && !positionLayouts.includes(spatial.layout)) {
      throw new Error(`Position can only be set when layout is one of: ${positionLayouts.join(', ')}`);
    }
    
    // 验证overflow属性
    if (spatial.overflow) {
      const validOverflow = ['visible', 'hidden', 'scroll', 'auto', 'clip'];
      if (spatial.overflow.x && !validOverflow.includes(spatial.overflow.x)) {
        throw new Error(`Invalid overflow-x: ${spatial.overflow.x}`);
      }
      if (spatial.overflow.y && !validOverflow.includes(spatial.overflow.y)) {
        throw new Error(`Invalid overflow-y: ${spatial.overflow.y}`);
      }
    }
    
    return true;
  }
  
  private static isFlexDetails(details: any): details is FlexDetails {
    return 'direction' in details || 'justify' in details || 'align' in details || 'wrap' in details;
  }
  
  private static isGridDetails(details: any): details is GridDetails {
    return 'columns' in details || 'rows' in details || 'areas' in details;
  }
}

/**
 * 将空间属性转换为CSS
 */
export function spatialToCSS(spatial?: Spatial): Record<string, any> {
  if (!spatial) return {};
  
  const css: Record<string, any> = {};
  const { layout, display, size, spacing, position, overflow, layoutDetails } = spatial;
  
  // 处理显示类型（如果明确指定）
  if (display) {
    css.display = display;
  }
  
  // 处理布局模式
  if (layout === 'flex') {
    if (!display) css.display = 'flex'; // 如果没有明确指定display，使用默认值
    if (layoutDetails && 'direction' in layoutDetails) {
      css.flexDirection = layoutDetails.direction;
      css.justifyContent = layoutDetails.justify;
      css.alignItems = layoutDetails.align;
      if (layoutDetails.wrap) css.flexWrap = 'wrap';
    }
  } else if (layout === 'grid') {
    if (!display) css.display = 'grid';
    if (layoutDetails && 'columns' in layoutDetails) {
      css.gridTemplateColumns = typeof layoutDetails.columns === 'number' 
        ? `repeat(${layoutDetails.columns}, 1fr)` 
        : layoutDetails.columns;
      if (layoutDetails.rows) {
        css.gridTemplateRows = typeof layoutDetails.rows === 'number'
          ? `repeat(${layoutDetails.rows}, 1fr)`
          : layoutDetails.rows;
      }
      if (layoutDetails.areas) {
        css.gridTemplateAreas = layoutDetails.areas
          .map(row => `"${row.join(' ')}"`)
          .join(' ');
      }
    }
  } else if (layout === 'absolute') {
    css.position = 'absolute';
  } else if (layout === 'fixed') {
    css.position = 'fixed';
  } else if (layout === 'sticky') {
    css.position = 'sticky';
  } else if (layout === 'relative') {
    css.position = 'relative';
  } else if (layout === 'static') {
    css.position = 'static';
  }
  
  // 处理定位属性
  if (position) {
    if (position.inset) css.inset = position.inset;
    if (position.top !== undefined) css.top = position.top;
    if (position.right !== undefined) css.right = position.right;
    if (position.bottom !== undefined) css.bottom = position.bottom;
    if (position.left !== undefined) css.left = position.left;
    if (position.zIndex !== undefined) css.zIndex = position.zIndex;
  }
  
  // 处理尺寸
  if (size) {
    Object.assign(css, size);
  }
  
  // 处理间距
  if (spacing) {
    if (typeof spacing.padding === 'string') {
      css.padding = spacing.padding;
    } else if (spacing.padding) {
      Object.entries(spacing.padding).forEach(([key, value]) => {
        css[`padding${key.charAt(0).toUpperCase() + key.slice(1)}`] = value;
      });
    }
    
    if (typeof spacing.margin === 'string') {
      css.margin = spacing.margin;
    } else if (spacing.margin) {
      Object.entries(spacing.margin).forEach(([key, value]) => {
        css[`margin${key.charAt(0).toUpperCase() + key.slice(1)}`] = value;
      });
    }
    
    if (spacing.gap) css.gap = spacing.gap;
  }
  
  // 处理溢出控制
  if (overflow) {
    if (overflow.x) css.overflowX = overflow.x;
    if (overflow.y) css.overflowY = overflow.y;
    if (overflow.scrollBehavior) css.scrollBehavior = overflow.scrollBehavior;
    if (overflow.scrollSnapType) css.scrollSnapType = overflow.scrollSnapType;
  }
  
  return css;
}

/**
 * 空间属性预设
 */
export const spatialPresets = {
  // 居中容器
  centeredContainer: {
    layout: 'static' as const,
    size: { width: '100%', maxWidth: '1280px' },
    spacing: { margin: '0 auto', padding: '16px' }
  },
  
  // 弹性行
  flexRow: {
    layout: 'flex' as const,
    layoutDetails: { direction: 'row' as const, align: 'center' as const },
    spacing: { gap: '16px' }
  },
  
  // 弹性列
  flexColumn: {
    layout: 'flex' as const,
    layoutDetails: { direction: 'column' as const },
    spacing: { gap: '16px' }
  },
  
  // 网格布局
  grid12: {
    layout: 'grid' as const,
    layoutDetails: { columns: 12 },
    spacing: { gap: '16px' }
  },
  
  // 绝对定位
  absoluteTopRight: {
    layout: 'absolute' as const,
    position: { top: '0', right: '0' }
  }
} as const;