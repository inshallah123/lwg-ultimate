import { ThemeConfig, GlobalStyleConfig, YearViewConfig, MonthCardConfig, MonthViewConfig, WeekViewConfig } from '../types';

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
interface SpecialRule {
  section: keyof ThemeConfig;
  handler: (config: any, cssRules: string[]) => void;
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
      selector: 'body',
      property: 'opacity',
      configKey: 'opacity'
    }
  ],
  yearView: [
    {
      selector: '[class*="yearContainer"]',
      property: 'opacity',
      configKey: 'containerOpacity'
    },
    {
      selector: '[class*="yearContainer"]',
      property: 'border-radius',
      configKey: 'borderRadius',
      unit: 'px'
    },
    {
      selector: '[class*="yearContainer"]',
      property: 'box-shadow',
      configKey: 'boxShadow'
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
      selector: '[class*="monthCard"]',
      property: 'border-radius',
      configKey: 'borderRadius',
      unit: 'px'
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

// 特殊处理规则配置
const specialRulesConfig: SpecialRule[] = [
  // 全局背景处理
  {
    section: 'global' as const,
    handler: (config: GlobalStyleConfig, cssRules: string[]) => {
      const { backgroundColor, backgroundGradient, backgroundImage } = config;
      
      if (backgroundImage?.enabled && backgroundImage.url) {
        const bgRules = backgroundStrategies.backgroundImage(backgroundImage);
        cssRules.push(`body { ${bgRules.join('; ')} }`);
      } else if (backgroundGradient?.enabled) {
        const bgValue = backgroundStrategies.gradient(backgroundGradient);
        cssRules.push(`body { background: ${bgValue} !important; }`);
      } else if (backgroundColor) {
        cssRules.push(`body { background: ${backgroundColor} !important; }`);
      }
    }
  },
  // Year View 背景处理
  {
    section: 'yearView' as const,
    handler: (config: YearViewConfig, cssRules: string[]) => {
      const { containerBackground, containerGradient, backgroundImage } = config;
      
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
    handler: (config: MonthCardConfig, cssRules: string[]) => {
      const { background, backgroundGradient } = config;
      
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
    handler: (config: MonthViewConfig, cssRules: string[]) => {
      const { containerBackground, containerGradient, dayCellHoverBackground } = config;
      
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
  // Week View 时间列特殊处理
  {
    section: 'weekView' as const,
    handler: (config: WeekViewConfig, cssRules: string[]) => {
      const { timeColumnBackground, todayHeaderColor } = config;
      
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