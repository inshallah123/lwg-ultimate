import { ThemeConfig, GlobalStyleConfig, YearViewConfig, MonthCardConfig, MonthViewConfig, WeekViewConfig, EventColorsConfig } from '../types';

const THEME_STYLE_ID = 'custom-theme-styles';

interface GradientConfig {
  enabled: boolean;
  startColor: string;
  endColor: string;
  angle: number;
}

interface BackgroundImageConfig {
  enabled: boolean;
  url: string;
  size?: string;
  position?: string;
}

// 联合类型定义用于类型安全
type ConfigValue = string | number | boolean | undefined;
type ConfigTransform = (value: ConfigValue) => string;

// 样式规则类型定义
interface StyleRule {
  selector: string;
  property: string;
  configKey: string;
  unit?: string;
  transform?: ConfigTransform;
}

// 特殊规则处理器类型
type ConfigTypes = GlobalStyleConfig | YearViewConfig | MonthCardConfig | MonthViewConfig | WeekViewConfig | EventColorsConfig;

interface SpecialRule {
  section: keyof ThemeConfig;
  handler: (config: ConfigTypes, cssRules: string[]) => void;
}

// 特殊处理策略
const backgroundStrategies = {
  gradient: (gradient: GradientConfig): string => 
    `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`,
  
  backgroundImage: (bgImage: BackgroundImageConfig): string[] => 
    [`background-image: url("${bgImage.url}") !important`,
     `background-size: ${bgImage.size} !important`,
     `background-position: ${bgImage.position} !important`,
     `background-repeat: no-repeat !important`],

  yearViewBackgroundImage: (bgImage: BackgroundImageConfig): string[] =>
    [`background-image: url("${bgImage.url}") !important`,
     `background-size: cover !important`,
     `background-position: center !important`]
};

// 样式规则映射配置
const styleRulesConfig: Record<string, StyleRule[]> = {
  global: [
    {
      selector: '#root',
      property: 'opacity',
      configKey: 'opacity'
    },
    {
      selector: 'h1[class*="title"]',
      property: 'font-size',
      configKey: 'titleFontSize',
      unit: 'rem'
    },
    {
      selector: 'h1[class*="title"]::after',
      property: 'font-size',
      configKey: 'subtitleFontSize',
      unit: 'rem'
    }
  ],
  yearView: [
    {
      selector: '[class*="yearContainer"]',
      property: 'opacity',
      configKey: 'containerOpacity'
    },
    {
      selector: '[class*="yearHeader"]',
      property: 'font-size',
      configKey: 'titleFontSize',
      unit: 'rem'
    },
    {
      selector: '[class*="yearHeader"]',
      property: 'color',
      configKey: 'titleColor',
      transform: (color: ConfigValue) => `${color} !important; -webkit-text-fill-color: ${color}`
    },
    {
      selector: '[class*="yearHeader"]',
      property: 'font-weight',
      configKey: 'titleFontWeight'
    }
  ],
  monthCard: [
    {
      selector: '[class*="monthCard"]',
      property: 'opacity',
      configKey: 'opacity'
    },
    {
      selector: '[class*="monthCard"]',
      property: 'border-color',
      configKey: 'borderColor'
    },
    {
      selector: '[class*="monthNumber"]',
      property: 'font-size',
      configKey: 'fontSize',
      unit: 'em'
    },
    {
      selector: '[class*="monthNumber"]',
      property: 'color',
      configKey: 'fontColor'
    },
    {
      selector: '[class*="monthCard"]:hover',
      property: 'background',
      configKey: 'hoverBackground'
    },
    {
      selector: '[class*="monthCard"][class*="todayMonth"]',
      property: 'background',
      configKey: 'todayMonthBackground'
    },
    {
      selector: '[class*="monthCard"][class*="todayMonth"]',
      property: 'border',
      configKey: 'todayMonthBorderColor',
      transform: (color: ConfigValue) => `2px solid ${color}`
    }
  ],
  monthView: [
    {
      selector: '[class*="monthContainer"]',
      property: 'opacity',
      configKey: 'containerOpacity'
    },
    {
      selector: '[class*="monthContainer"]',
      property: 'border-radius',
      configKey: 'borderRadius',
      transform: () => '0'
    },
    {
      selector: '[class*="monthHeader"]',
      property: 'font-size',
      configKey: 'headerFontSize',
      unit: 'rem'
    },
    {
      selector: '[class*="monthHeader"]',
      property: 'color',
      configKey: 'headerColor',
      transform: (color: ConfigValue) => `${color} !important; -webkit-text-fill-color: ${color}`
    },
    {
      selector: '[class*="weekdayRow"]',
      property: 'background',
      configKey: 'weekdayBackground'
    },
    {
      selector: '[class*="weekdayHeader"]',
      property: 'color',
      configKey: 'weekdayColor'
    },
    {
      selector: '[class*="monthContainer"] [class*="dayCell"]',
      property: 'background',
      configKey: 'dayCellBackground'
    },
    {
      selector: '[class*="monthContainer"] [class*="dayNumber"]',
      property: 'font-size',
      configKey: 'dayNumberSize',
      unit: 'rem'
    },
    {
      selector: '[class*="monthContainer"] [class*="dayNumber"]',
      property: 'color',
      configKey: 'dayNumberColor'
    },
    {
      selector: '[class*="monthContainer"] [class*="today"]',
      property: 'background',
      configKey: 'todayBackground'
    },
    {
      selector: '[class*="monthContainer"] [class*="today"] [class*="dayNumber"]',
      property: 'color',
      configKey: 'todayColor'
    },
    {
      selector: '[class*="monthContainer"] [class*="lunar"]',
      property: 'font-size',
      configKey: 'lunarSize',
      unit: 'rem'
    },
    {
      selector: '[class*="monthContainer"] [class*="lunar"]',
      property: 'color',
      configKey: 'lunarColor'
    },
    {
      selector: '[class*="monthContainer"] [class*="festival"]',
      property: 'color',
      configKey: 'festivalColor'
    },
    {
      selector: '[class*="monthContainer"] [class*="solarTerm"]',
      property: 'color',
      configKey: 'solarTermColor'
    }
  ],
  weekView: [
    {
      selector: '[class*="weekContainer"]',
      property: 'background',
      configKey: 'containerBackground'
    },
    {
      selector: '[class*="weekContainer"]',
      property: 'opacity',
      configKey: 'containerOpacity'
    },
    {
      selector: '[class*="weekContainer"]',
      property: 'border-radius',
      configKey: 'borderRadius',
      transform: () => '0'
    },
    {
      selector: '[class*="weekHeader"]',
      property: 'font-size',
      configKey: 'headerFontSize',
      unit: 'rem'
    },
    {
      selector: '[class*="weekHeader"]',
      property: 'color',
      configKey: 'headerColor'
    },
    {
      selector: '[class*="dayHeader"]',
      property: 'background',
      configKey: 'dayHeaderBackground'
    },
    {
      selector: '[class*="dayName"]',
      property: 'color',
      configKey: 'dayNameColor'
    },
    {
      selector: '[class*="dayDate"]',
      property: 'color',
      configKey: 'dayDateColor'
    },
    {
      selector: '[class*="dayHeader"][class*="today"]',
      property: 'background',
      configKey: 'todayHeaderBackground'
    },
    {
      selector: '[class*="timeSlot"]',
      property: 'color',
      configKey: 'timeSlotColor'
    },
    {
      selector: '[class*="timeSlot"]',
      property: 'font-size',
      configKey: 'timeSlotSize',
      unit: 'rem'
    },
    {
      selector: '[class*="hourCell"]',
      property: 'background',
      configKey: 'hourCellBackground'
    },
    {
      selector: '[class*="hourCell"]',
      property: 'border-color',
      configKey: 'hourCellBorderColor'
    },
    {
      selector: '[class*="hourCell"]:hover',
      property: 'background',
      configKey: 'hourCellHoverBackground'
    },
    {
      selector: '[class*="weekContainer"] [class*="lunar"]',
      property: 'font-size',
      configKey: 'lunarSize',
      unit: 'rem'
    },
    {
      selector: '[class*="weekContainer"] [class*="lunar"]',
      property: 'color',
      configKey: 'lunarColor'
    },
    {
      selector: '[class*="weekContainer"] [class*="festival"]',
      property: 'color',
      configKey: 'festivalColor'
    },
    {
      selector: '[class*="weekContainer"] [class*="solarTerm"]',
      property: 'color',
      configKey: 'solarTermColor'
    }
  ]
};

// 事件颜色CSS变量生成
function generateEventColorVariables(eventColors: EventColorsConfig): string[] {
  const cssRules: string[] = [];
  const tags = ['private', 'work', 'balance', 'custom'] as const;
  
  tags.forEach(tag => {
    const config = eventColors[tag];
    if (!config) return;
    
    // 背景颜色或渐变
    if (config.gradient?.enabled) {
      const gradient = `linear-gradient(${config.gradient.angle}deg, ${config.gradient.startColor}, ${config.gradient.endColor})`;
      cssRules.push(`--event-${tag}-background: ${gradient};`);
      cssRules.push(`--event-${tag}-gradient: ${gradient};`);
      cssRules.push(`--event-${tag}-color: ${config.gradient.startColor};`); // 边框使用起始颜色
    } else if (config.color) {
      // 纯色模式：清除gradient变量，设置background
      cssRules.push(`--event-${tag}-gradient: initial;`); // 清除渐变
      cssRules.push(`--event-${tag}-background: ${config.color};`);
      cssRules.push(`--event-${tag}-color: ${config.color};`);
    }
    
    // 文字颜色
    if (config.textColor) {
      cssRules.push(`--event-${tag}-text: ${config.textColor};`);
    }
    
    // 指示点颜色
    if (config.dotColor) {
      cssRules.push(`--event-${tag}-dot: ${config.dotColor};`);
    } else if (config.color) {
      cssRules.push(`--event-${tag}-dot: ${config.color};`);
    }
  });
  
  return cssRules.length > 0 ? [`:root { ${cssRules.join(' ')} }`] : [];
}

// 特殊处理规则配置
const specialRulesConfig: SpecialRule[] = [
  // 全局背景和标题处理
  {
    section: 'global' as const,
    handler: (config: ConfigTypes, cssRules: string[]) => {
      const globalConfig = config as GlobalStyleConfig;
      const { backgroundColor, backgroundGradient, backgroundImage, titleColor, subtitleColor } = globalConfig;
      
      if (backgroundImage?.enabled && backgroundImage.url) {
        const bgRules = backgroundStrategies.backgroundImage(backgroundImage);
        cssRules.push(`body { ${bgRules.join('; ')} }`);
      } else if (backgroundGradient?.enabled) {
        const bgValue = backgroundStrategies.gradient(backgroundGradient);
        cssRules.push(`body { background: ${bgValue} !important; }`);
      } else if (backgroundColor) {
        cssRules.push(`body { background: ${backgroundColor} !important; }`);
      }
      
      // 标题颜色处理（需要覆盖渐变）
      if (titleColor) {
        cssRules.push(`h1[class*="title"] { 
          background: ${titleColor} !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }`);
      }
      
      // 副标题颜色处理
      if (subtitleColor) {
        cssRules.push(`h1[class*="title"]::after { 
          background: ${subtitleColor} !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }`);
      }
    }
  },
  // Year View 背景处理
  {
    section: 'yearView' as const,
    handler: (config: ConfigTypes, cssRules: string[]) => {
      const yearConfig = config as YearViewConfig;
      const { containerBackground, containerGradient, backgroundImage } = yearConfig;
      
      if (backgroundImage?.enabled && backgroundImage.url) {
        const bgRules = backgroundStrategies.yearViewBackgroundImage(backgroundImage);
        cssRules.push(`[class*="yearContainer"] { ${bgRules.join('; ')} }`);
      } else if (containerGradient?.enabled) {
        const bgValue = backgroundStrategies.gradient(containerGradient);
        cssRules.push(`[class*="yearContainer"] { background: ${bgValue} !important; }`);
      } else if (containerBackground) {
        cssRules.push(`[class*="yearContainer"] { background: ${containerBackground} !important; }`);
      }
    }
  },
  // Month Card 背景处理
  {
    section: 'monthCard' as const,
    handler: (config: ConfigTypes, cssRules: string[]) => {
      const monthCardConfig = config as MonthCardConfig;
      const { background, backgroundGradient } = monthCardConfig;
      
      if (backgroundGradient?.enabled) {
        const bgValue = backgroundStrategies.gradient(backgroundGradient);
        cssRules.push(`[class*="monthCard"] { background: ${bgValue} !important; }`);
      } else if (background) {
        cssRules.push(`[class*="monthCard"] { background: ${background} !important; }`);
      }
    }
  },
  // Month View 背景和特殊悬浮处理
  {
    section: 'monthView' as const,
    handler: (config: ConfigTypes, cssRules: string[]) => {
      const monthViewConfig = config as MonthViewConfig;
      const { containerBackground, containerGradient, dayCellHoverBackground } = monthViewConfig;
      
      // 容器背景
      if (containerGradient?.enabled) {
        const bgValue = backgroundStrategies.gradient(containerGradient);
        cssRules.push(`[class*="monthContainer"] { background: ${bgValue} !important; }`);
      } else if (containerBackground) {
        cssRules.push(`[class*="monthContainer"] { background: ${containerBackground} !important; }`);
      }
      
      // 日期单元格悬浮特殊处理
      if (dayCellHoverBackground) {
        cssRules.push(
          `[class*="monthContainer"] [class*="dayCell"]:hover { background: ${dayCellHoverBackground} !important; }`,
          `[class*="monthContainer"] [class*="dayCell"]:hover [class*="dayCellHeader"] { background: transparent !important; }`,
          `[class*="monthContainer"] [class*="dayCell"]:hover [class*="dayNumber"] { background: transparent !important; }`,
          `[class*="monthContainer"] [class*="dayCell"]:hover [class*="lunarInfo"] { background: transparent !important; }`
        );
      }
    }
  },
  // Week View 背景和时间列特殊处理
  {
    section: 'weekView' as const,
    handler: (config: ConfigTypes, cssRules: string[]) => {
      const weekViewConfig = config as WeekViewConfig;
      const { containerBackground, containerGradient, timeColumnBackground, todayHeaderColor } = weekViewConfig;
      
      // 容器背景
      if (containerGradient?.enabled) {
        const bgValue = backgroundStrategies.gradient(containerGradient);
        cssRules.push(`[class*="weekContainer"] { background: ${bgValue} !important; }`);
      } else if (containerBackground) {
        cssRules.push(`[class*="weekContainer"] { background: ${containerBackground} !important; }`);
      }
      
      // 时间列背景特殊处理
      if (timeColumnBackground) {
        cssRules.push(
          `[class*="timeColumn"] { background: ${timeColumnBackground} !important; }`,
          `[class*="timeSlot"] { background: ${timeColumnBackground} !important; }`,
          `[class*="cornerCell"] { background: ${timeColumnBackground} !important; }`
        );
      }
      
      // 今天标题颜色特殊处理
      if (todayHeaderColor) {
        cssRules.push(`[class*="dayHeader"][class*="today"] [class*="dayName"], [class*="dayHeader"][class*="today"] [class*="dayDate"] { color: ${todayHeaderColor} !important; }`);
      }
    }
  }
];

// 通用样式规则生成器
function generateStyleRule(selector: string, property: string, value: ConfigValue, unit = '', transform?: ConfigTransform): string {
  if (value === undefined || value === null) return '';
  
  const finalValue = transform ? transform(value) : `${value}${unit}`;
  return `${selector} { ${property}: ${finalValue} !important; }`;
}

// 根据配置生成CSS规则
function generateCssRules(config: ThemeConfig): string[] {
  const cssRules: string[] = [];
  
  // 处理常规样式规则
  Object.entries(styleRulesConfig).forEach(([sectionKey, rules]) => {
    const sectionConfig = config[sectionKey as keyof ThemeConfig];
    if (!sectionConfig) return;
    
    rules.forEach(rule => {
      const value = (sectionConfig as Record<string, ConfigValue>)[rule.configKey];
      if (value !== undefined && value !== null) {
        const styleRule = generateStyleRule(
          rule.selector,
          rule.property,
          value,
          rule.unit || '',
          rule.transform
        );
        if (styleRule) cssRules.push(styleRule);
      }
    });
  });
  
  // 处理特殊规则
  specialRulesConfig.forEach(specialRule => {
    const sectionConfig = config[specialRule.section as keyof ThemeConfig];
    if (sectionConfig) {
      specialRule.handler(sectionConfig, cssRules);
    }
  });
  
  // 处理事件颜色
  if (config.eventColors) {
    const eventColorRules = generateEventColorVariables(config.eventColors);
    cssRules.push(...eventColorRules);
  }
  
  return cssRules;
}

export function applyThemeToDOM(config: ThemeConfig) {
  let styleElement = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = THEME_STYLE_ID;
    document.head.appendChild(styleElement);
  }
  
  const cssRules = generateCssRules(config);
  styleElement.textContent = cssRules.join('\n');
}

export function removeThemeFromDOM() {
  const styleElement = document.getElementById(THEME_STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
}