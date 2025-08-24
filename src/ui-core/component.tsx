/**
 * UI组件系统
 * 所有组件必须严格遵守元规则定义
 */

import React from 'react';
import { Presentation, PresentationValidator, presentationToCSS } from './presentation';
import { Navigation } from './navigation';
import { IO } from './io';

/**
 * UI组件定义
 * 必须且只能包含presentation和interaction
 */
export interface UIComponent {
  // 展示层 - 必须提供
  presentation: Presentation;
  
  // 交互层 - 可选，但如果提供必须符合规范
  interaction?: {
    navigation?: Navigation;
    io?: IO;
  };
  
  // 不允许任何其他属性
}

/**
 * 组件工厂
 * 强制所有组件遵守元规则
 */
export function createComponent<P = {}>(
  name: string,
  definition: UIComponent,
  render?: (props: P & { styles: React.CSSProperties }) => React.ReactNode
): React.FC<P> {
  // 编译时类型检查已确保基本结构
  // 运行时进一步验证
  if (!PresentationValidator.validate(definition.presentation)) {
    throw new Error(`Component "${name}" presentation definition violates strict rules`);
  }
  
  // 将展示层定义转换为CSS
  const styles = presentationToCSS(definition.presentation);
  
  // 创建React组件
  const Component: React.FC<P> = (props) => {
    // 如果提供了自定义渲染函数
    if (render) {
      return <>{render({ ...props, styles })}</>;
    }
    
    // 默认渲染
    return (
      <div style={styles} data-component={name}>
        {(props as any).children}
      </div>
    );
  };
  
  Component.displayName = name;
  
  // 附加元数据
  (Component as any).__strictDefinition = definition;
  (Component as any).__isStrictComponent = true;
  
  return Component;
}

/**
 * 严格组件组合器
 * 用于组合多个严格组件
 */
export function composeComponents(
  components: Record<string, UIComponent>
): Record<string, React.FC<any>> {
  const result: Record<string, React.FC<any>> = {};
  
  for (const [name, definition] of Object.entries(components)) {
    result[name] = createComponent(name, definition);
  }
  
  return result;
}

/**
 * 严格组件验证HOC
 * 包装现有组件，确保其符合严格模式
 */
export function withStrictValidation<P extends object>(
  Component: React.ComponentType<P>,
  definition: UIComponent
): React.FC<P> {
  return (props: P) => {
    // 验证定义
    if (!PresentationValidator.validate(definition.presentation)) {
      console.error('Component violates strict presentation rules');
      return null;
    }
    
    // 注入样式
    const styles = presentationToCSS(definition.presentation);
    
    return <Component {...props} style={styles} />;
  };
}

/**
 * 严格模式Hook
 * 在组件内部使用，确保遵守规则
 */
export function usePresentation(
  presentation: Presentation
): React.CSSProperties {
  React.useEffect(() => {
    // 开发环境验证
    if (process.env.NODE_ENV === 'development') {
      try {
        PresentationValidator.validate(presentation);
      } catch (error) {
        console.error('Presentation validation failed:', error);
      }
    }
  }, [presentation]);
  
  return React.useMemo(
    () => presentationToCSS(presentation),
    [presentation]
  );
}

/**
 * 示例：使用严格模式创建日历组件
 */
export const StrictCalendarComponents = {
  // 月视图容器 - 展示新的overflow和scrollBehavior属性
  MonthContainer: createComponent('MonthContainer', {
    presentation: {
      spatial: {
        layout: 'flex',
        layoutDetails: {
          direction: 'column'
        },
        size: {
          width: '100%',
          height: 'calc(100vh - 150px)'
        },
        spacing: {
          padding: '24px'
        },
        overflow: {
          y: 'auto',
          scrollBehavior: 'smooth'
        }
      },
      visual: {
        colors: {
          background: '#ffffff'
        },
        border: {
          radius: '12px'
        },
        backdropFilter: 'blur(10px)' // 新增毛玻璃效果
      },
      effects: {
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        willChange: 'transform' // 性能优化
      }
    }
  }),
  
  // 日历格子 - 展示新的cursor和userSelect属性
  DayCell: createComponent('DayCell', {
    presentation: {
      spatial: {
        layout: 'flex',
        layoutDetails: {
          direction: 'column',
          align: 'center',
          justify: 'center'
        },
        size: {
          minHeight: '80px'
        },
        spacing: {
          padding: '8px'
        }
      },
      visual: {
        border: {
          width: '1px',
          style: 'solid',
          radius: '4px'
        }
      },
      effects: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: {
          property: ['background-color', 'border-color', 'transform'],
          duration: '150ms'
        },
        transform: {
          scale: 1
        }
      }
    }
  }),
  
  // 事件指示器 - 展示Typography的新属性
  EventIndicator: createComponent('EventIndicator', {
    presentation: {
      spatial: {
        layout: 'flex',
        layoutDetails: {
          direction: 'row',
          align: 'center'
        },
        size: {
          height: '20px'
        },
        spacing: {
          padding: '2px 6px',
          margin: '2px 0'
        }
      },
      visual: {
        border: {
          radius: '10px'
        },
        opacity: 0.9
      },
      typography: {
        fontSize: '12px',
        fontWeight: 500,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }
  }),
  
  // 固定头部 - 展示sticky布局和新视觉效果
  StickyHeader: createComponent('StickyHeader', {
    presentation: {
      spatial: {
        layout: 'sticky',
        position: {
          top: '0',
          zIndex: 100
        },
        size: {
          width: '100%',
          height: '60px'
        },
        spacing: {
          padding: '0 24px'
        }
      },
      visual: {
        colors: {
          background: 'rgba(255, 255, 255, 0.8)'
        },
        backdropFilter: 'blur(20px) saturate(180%)',
        border: {
          width: '1px',
          style: 'solid',
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      effects: {
        shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        contain: 'layout style'
      }
    }
  }),
  
  // 交互按钮 - 展示完整的交互反馈
  InteractiveButton: createComponent('InteractiveButton', {
    presentation: {
      spatial: {
        layout: 'flex',
        display: 'inline-flex',
        layoutDetails: {
          align: 'center',
          justify: 'center'
        },
        spacing: {
          padding: '8px 16px'
        }
      },
      visual: {
        colors: {
          background: '#5B8DBE',
          text: '#ffffff'
        },
        border: {
          radius: '8px',
          style: 'none'
        }
      },
      typography: {
        fontSize: '14px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      effects: {
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'auto',
        transition: {
          property: ['all'],
          duration: '200ms',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        transform: {
          scale: 1
        },
        willChange: 'transform, box-shadow'
      }
    }
  })
};

/**
 * 类型守卫：检查组件是否为严格模式组件
 */
export function isStrictComponent(
  component: any
): component is React.FC & { __isStrictComponent: true } {
  return component && component.__isStrictComponent === true;
}

/**
 * 获取组件的严格定义
 */
export function getStrictDefinition(
  component: any
): UIComponent | null {
  if (isStrictComponent(component)) {
    return (component as any).__strictDefinition;
  }
  return null;
}

/**
 * 验证整个组件树是否符合严格模式
 */
export function validateComponentTree(
  components: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [name, component] of Object.entries(components)) {
    if (!isStrictComponent(component)) {
      errors.push(`Component "${name}" is not a strict component`);
      continue;
    }
    
    const definition = getStrictDefinition(component);
    if (!definition) {
      errors.push(`Component "${name}" has no strict definition`);
      continue;
    }
    
    try {
      PresentationValidator.validate(definition.presentation);
    } catch (error: any) {
      errors.push(`Component "${name}": ${error.message}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}