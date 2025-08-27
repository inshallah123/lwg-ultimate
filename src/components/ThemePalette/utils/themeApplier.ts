import { ThemeConfig } from '../types';

const THEME_STYLE_ID = 'custom-theme-styles';

export function applyThemeToDOM(config: ThemeConfig) {
  let styleElement = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = THEME_STYLE_ID;
    document.head.appendChild(styleElement);
  }
  
  const cssRules: string[] = [];
  
  // 全局样式
  if (config.global) {
    const { backgroundColor, backgroundGradient, opacity, backgroundImage } = config.global;
    
    if (backgroundColor || backgroundGradient?.enabled || backgroundImage?.enabled) {
      let bgValue = backgroundColor || 'var(--color-bg-secondary)';
      
      if (backgroundGradient?.enabled) {
        bgValue = `linear-gradient(${backgroundGradient.angle}deg, ${backgroundGradient.startColor}, ${backgroundGradient.endColor})`;
      }
      
      if (backgroundImage?.enabled && backgroundImage.url) {
        bgValue = `url("${backgroundImage.url}")`;
        cssRules.push(`
          body {
            background-image: ${bgValue} !important;
            background-size: ${backgroundImage.size} !important;
            background-position: ${backgroundImage.position} !important;
            background-repeat: no-repeat !important;
          }
        `);
      } else {
        cssRules.push(`body { background: ${bgValue} !important; }`);
      }
    }
    
    if (opacity !== undefined) {
      cssRules.push(`body { opacity: ${opacity} !important; }`);
    }
  }
  
  // Year View 样式
  if (config.yearView) {
    const {
      containerBackground, containerGradient, containerOpacity,
      borderRadius, boxShadow, titleFontSize, titleColor, titleFontWeight,
      backgroundImage
    } = config.yearView;
    
    if (containerBackground || containerGradient?.enabled) {
      let bgValue = containerBackground || '#ffffff';
      if (containerGradient?.enabled) {
        bgValue = `linear-gradient(${containerGradient.angle}deg, ${containerGradient.startColor}, ${containerGradient.endColor})`;
      }
      // 使用属性选择器匹配CSS Modules生成的类名
      cssRules.push(`[class*="yearContainer"] { background: ${bgValue} !important; }`);
    }
    
    if (backgroundImage?.enabled && backgroundImage.url) {
      cssRules.push(`
        [class*="yearContainer"] {
          background-image: url("${backgroundImage.url}") !important;
          background-size: cover !important;
          background-position: center !important;
        }
      `);
    }
    
    if (containerOpacity !== undefined) {
      cssRules.push(`[class*="yearContainer"] { opacity: ${containerOpacity} !important; }`);
    }
    
    if (borderRadius !== undefined) {
      cssRules.push(`[class*="yearContainer"] { border-radius: ${borderRadius}px !important; }`);
    }
    
    if (boxShadow) {
      cssRules.push(`[class*="yearContainer"] { box-shadow: ${boxShadow} !important; }`);
    }
    
    if (titleFontSize !== undefined) {
      cssRules.push(`[class*="yearHeader"] { font-size: ${titleFontSize}rem !important; }`);
    }
    
    if (titleColor) {
      cssRules.push(`[class*="yearHeader"] { color: ${titleColor} !important; -webkit-text-fill-color: ${titleColor} !important; }`);
    }
    
    if (titleFontWeight !== undefined) {
      cssRules.push(`[class*="yearHeader"] { font-weight: ${titleFontWeight} !important; }`);
    }
  }
  
  // Month Card 样式
  if (config.monthCard) {
    const {
      background, backgroundGradient, opacity, fontSize, fontColor,
      hoverBackground, borderColor, borderRadius,
      todayMonthBackground, todayMonthBorderColor
    } = config.monthCard;
    
    if (background || backgroundGradient?.enabled) {
      let bgValue = background || '#ffffff';
      if (backgroundGradient?.enabled) {
        bgValue = `linear-gradient(${backgroundGradient.angle}deg, ${backgroundGradient.startColor}, ${backgroundGradient.endColor})`;
      }
      cssRules.push(`[class*="monthCard"] { background: ${bgValue} !important; }`);
    }
    
    if (opacity !== undefined) {
      cssRules.push(`[class*="monthCard"] { opacity: ${opacity} !important; }`);
    }
    
    if (borderColor) {
      cssRules.push(`[class*="monthCard"] { border-color: ${borderColor} !important; }`);
    }
    
    if (borderRadius !== undefined) {
      cssRules.push(`[class*="monthCard"] { border-radius: ${borderRadius}px !important; }`);
    }
    
    if (fontSize !== undefined) {
      cssRules.push(`[class*="monthNumber"] { font-size: ${fontSize}em !important; }`);
    }
    
    if (fontColor) {
      cssRules.push(`[class*="monthNumber"] { color: ${fontColor} !important; }`);
    }
    
    if (hoverBackground) {
      cssRules.push(`[class*="monthCard"]:hover { background: ${hoverBackground} !important; }`);
    }
    
    if (todayMonthBackground) {
      cssRules.push(`[class*="monthCard"][class*="todayMonth"] { background: ${todayMonthBackground} !important; }`);
    }
    
    if (todayMonthBorderColor) {
      // 修复边框样式，需要设置border而不仅仅是border-color
      cssRules.push(`[class*="monthCard"][class*="todayMonth"] { border: 2px solid ${todayMonthBorderColor} !important; }`);
    }
  }
  
  // Month View 样式
  if (config.monthView) {
    const {
      containerBackground, containerGradient,
      headerFontSize, headerColor,
      weekdayBackground, weekdayColor,
      dayCellBackground, dayCellHoverBackground,
      dayNumberSize, dayNumberColor,
      todayBackground, todayColor,
      lunarSize, lunarColor, festivalColor, solarTermColor
    } = config.monthView;
    
    // 月视图容器样式
    if (containerBackground || containerGradient?.enabled) {
      let bgValue = containerBackground || '#ffffff';
      if (containerGradient?.enabled) {
        bgValue = `linear-gradient(${containerGradient.angle}deg, ${containerGradient.startColor}, ${containerGradient.endColor})`;
      }
      cssRules.push(`[class*="monthContainer"] { background: ${bgValue} !important; }`);
    }
    
    // 月视图标题样式
    if (headerFontSize !== undefined) {
      cssRules.push(`[class*="monthHeader"] { font-size: ${headerFontSize}rem !important; }`);
    }
    
    if (headerColor) {
      cssRules.push(`[class*="monthHeader"] { color: ${headerColor} !important; -webkit-text-fill-color: ${headerColor} !important; }`);
    }
    
    // 星期标题样式
    if (weekdayBackground) {
      cssRules.push(`[class*="weekdayRow"] { background: ${weekdayBackground} !important; }`);
    }
    
    if (weekdayColor) {
      cssRules.push(`[class*="weekdayHeader"] { color: ${weekdayColor} !important; }`);
    }
    
    // 日期单元格样式
    if (dayCellBackground) {
      cssRules.push(`[class*="monthContainer"] [class*="dayCell"] { background: ${dayCellBackground} !important; }`);
    }
    
    if (dayCellHoverBackground) {
      cssRules.push(`[class*="monthContainer"] [class*="dayCell"]:hover { background: ${dayCellHoverBackground} !important; }`);
    }
    
    if (dayNumberSize !== undefined) {
      cssRules.push(`[class*="monthContainer"] [class*="dayNumber"] { font-size: ${dayNumberSize}rem !important; }`);
    }
    
    if (dayNumberColor) {
      cssRules.push(`[class*="monthContainer"] [class*="dayNumber"] { color: ${dayNumberColor} !important; }`);
    }
    
    // 今天样式  
    if (todayBackground) {
      cssRules.push(`[class*="monthContainer"] [class*="today"] { background: ${todayBackground} !important; }`);
    }
    
    if (todayColor) {
      cssRules.push(`[class*="monthContainer"] [class*="today"] [class*="dayNumber"] { color: ${todayColor} !important; }`);
    }
    
    // 月视图农历样式
    if (lunarSize !== undefined) {
      cssRules.push(`[class*="monthContainer"] [class*="lunar"] { font-size: ${lunarSize}rem !important; }`);
    }
    
    if (lunarColor) {
      cssRules.push(`[class*="monthContainer"] [class*="lunar"] { color: ${lunarColor} !important; }`);
    }
    
    if (festivalColor) {
      cssRules.push(`[class*="monthContainer"] [class*="festival"] { color: ${festivalColor} !important; }`);
    }
    
    if (solarTermColor) {
      cssRules.push(`[class*="monthContainer"] [class*="solarTerm"] { color: ${solarTermColor} !important; }`);
    }
  }
    
  
  // Week View 样式
  if (config.weekView) {
    const {
      containerBackground,
      headerFontSize, headerColor,
      dayHeaderBackground, dayNameColor, dayDateColor,
      todayHeaderBackground, todayHeaderColor,
      timeColumnBackground, timeSlotColor, timeSlotSize,
      hourCellBackground, hourCellBorderColor, hourCellHoverBackground,
      lunarSize, lunarColor, festivalColor, solarTermColor
    } = config.weekView;
    
    // 周视图容器样式
    if (containerBackground) {
      cssRules.push(`[class*="weekContainer"] { background: ${containerBackground} !important; }`);
    }
    
    // 周视图标题样式
    if (headerFontSize !== undefined) {
      cssRules.push(`[class*="weekHeader"] { font-size: ${headerFontSize}rem !important; }`);
    }
    
    if (headerColor) {
      cssRules.push(`[class*="weekHeader"] { color: ${headerColor} !important; }`);
    }
    
    // 日期列标题样式
    if (dayHeaderBackground) {
      cssRules.push(`[class*="dayHeader"] { background: ${dayHeaderBackground} !important; }`);
    }
    
    if (dayNameColor) {
      cssRules.push(`[class*="dayName"] { color: ${dayNameColor} !important; }`);
    }
    
    if (dayDateColor) {
      cssRules.push(`[class*="dayDate"] { color: ${dayDateColor} !important; }`);
    }
    
    // 今天标题样式
    if (todayHeaderBackground) {
      cssRules.push(`[class*="dayHeader"][class*="today"] { background: ${todayHeaderBackground} !important; }`);
    }
    
    if (todayHeaderColor) {
      cssRules.push(`[class*="dayHeader"][class*="today"] [class*="dayName"], [class*="dayHeader"][class*="today"] [class*="dayDate"] { color: ${todayHeaderColor} !important; }`);
    }
    
    // 时间列样式
    if (timeColumnBackground) {
      cssRules.push(`[class*="timeColumn"] { background: ${timeColumnBackground} !important; }`);
    }
    
    if (timeSlotColor) {
      cssRules.push(`[class*="timeSlot"] { color: ${timeSlotColor} !important; }`);
    }
    
    if (timeSlotSize !== undefined) {
      cssRules.push(`[class*="timeSlot"] { font-size: ${timeSlotSize}rem !important; }`);
    }
    
    // 小时格子样式
    if (hourCellBackground) {
      cssRules.push(`[class*="hourCell"] { background: ${hourCellBackground} !important; }`);
    }
    
    if (hourCellBorderColor) {
      cssRules.push(`[class*="hourCell"] { border-color: ${hourCellBorderColor} !important; }`);
    }
    
    if (hourCellHoverBackground) {
      cssRules.push(`[class*="hourCell"]:hover { background: ${hourCellHoverBackground} !important; }`);
    }
    
    // 周视图农历样式
    if (lunarSize !== undefined) {
      cssRules.push(`[class*="weekContainer"] [class*="lunar"] { font-size: ${lunarSize}rem !important; }`);
    }
    
    if (lunarColor) {
      cssRules.push(`[class*="weekContainer"] [class*="lunar"] { color: ${lunarColor} !important; }`);
    }
    
    if (festivalColor) {
      cssRules.push(`[class*="weekContainer"] [class*="festival"] { color: ${festivalColor} !important; }`);
    }
    
    if (solarTermColor) {
      cssRules.push(`[class*="weekContainer"] [class*="solarTerm"] { color: ${solarTermColor} !important; }`);
    }
  }
  
  styleElement.textContent = cssRules.join('\n');
}

export function removeThemeFromDOM() {
  const styleElement = document.getElementById(THEME_STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
}