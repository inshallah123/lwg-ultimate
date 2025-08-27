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
      cssRules.push(`.yearContainer { background: ${bgValue} !important; }`);
    }
    
    if (backgroundImage?.enabled && backgroundImage.url) {
      cssRules.push(`
        .yearContainer {
          background-image: url("${backgroundImage.url}") !important;
          background-size: cover !important;
          background-position: center !important;
        }
      `);
    }
    
    if (containerOpacity !== undefined) {
      cssRules.push(`.yearContainer { opacity: ${containerOpacity} !important; }`);
    }
    
    if (borderRadius !== undefined) {
      cssRules.push(`.yearContainer { border-radius: ${borderRadius}px !important; }`);
    }
    
    if (boxShadow) {
      cssRules.push(`.yearContainer { box-shadow: ${boxShadow} !important; }`);
    }
    
    if (titleFontSize !== undefined) {
      cssRules.push(`.yearHeader { font-size: ${titleFontSize}rem !important; }`);
    }
    
    if (titleColor) {
      cssRules.push(`.yearHeader { color: ${titleColor} !important; -webkit-text-fill-color: ${titleColor} !important; }`);
    }
    
    if (titleFontWeight !== undefined) {
      cssRules.push(`.yearHeader { font-weight: ${titleFontWeight} !important; }`);
    }
  }
  
  // Year Section 样式
  if (config.yearSection) {
    const {
      currentYearBackground, currentYearOpacity, fontSize,
      fontColor, hoverBackground, selectedBackground
    } = config.yearSection;
    
    if (currentYearBackground) {
      // 修复：伪元素显示年份数字，应该用color属性而不是background
      cssRules.push(`[class*="yearSection"][class*="currentYear"]::before { color: ${currentYearBackground} !important; }`);
    }
    
    if (currentYearOpacity !== undefined) {
      cssRules.push(`[class*="yearSection"][class*="currentYear"]::before { opacity: ${currentYearOpacity} !important; }`);
    }
    
    if (fontSize !== undefined) {
      cssRules.push(`[class*="yearSection"][class*="currentYear"]::before { font-size: ${fontSize}em !important; }`);
    }
    
    if (fontColor) {
      cssRules.push(`[class*="yearSection"] { color: ${fontColor} !important; }`);
    }
    
    if (hoverBackground) {
      cssRules.push(`[class*="yearSection"]:hover { background: ${hoverBackground} !important; }`);
    }
    
    if (selectedBackground) {
      cssRules.push(`[class*="yearSection"][class*="selected"] { background: ${selectedBackground} !important; }`);
    }
  }
  
  // Month Card 样式
  if (config.monthCard) {
    const {
      background, backgroundGradient, opacity, fontSize, fontColor,
      hoverBackground, selectedBackground, borderColor, borderRadius,
      currentMonthBackground, currentMonthBorderColor,
      todayMonthBackground, todayMonthBorderColor
    } = config.monthCard;
    
    if (background || backgroundGradient?.enabled) {
      let bgValue = background || '#ffffff';
      if (backgroundGradient?.enabled) {
        bgValue = `linear-gradient(${backgroundGradient.angle}deg, ${backgroundGradient.startColor}, ${backgroundGradient.endColor})`;
      }
      cssRules.push(`.monthCard { background: ${bgValue} !important; }`);
    }
    
    if (opacity !== undefined) {
      cssRules.push(`.monthCard { opacity: ${opacity} !important; }`);
    }
    
    if (borderColor) {
      cssRules.push(`.monthCard { border-color: ${borderColor} !important; }`);
    }
    
    if (borderRadius !== undefined) {
      cssRules.push(`.monthCard { border-radius: ${borderRadius}px !important; }`);
    }
    
    if (fontSize !== undefined) {
      cssRules.push(`.monthNumber { font-size: ${fontSize}em !important; }`);
    }
    
    if (fontColor) {
      cssRules.push(`.monthNumber { color: ${fontColor} !important; }`);
    }
    
    if (hoverBackground) {
      cssRules.push(`.monthCard:hover { background: ${hoverBackground} !important; }`);
    }
    
    if (selectedBackground) {
      cssRules.push(`.monthCard.selected { background: ${selectedBackground} !important; }`);
    }
    
    if (currentMonthBackground) {
      cssRules.push(`.currentMonth { background: ${currentMonthBackground} !important; }`);
    }
    
    if (currentMonthBorderColor) {
      cssRules.push(`.currentMonth { border-color: ${currentMonthBorderColor} !important; }`);
    }
    
    if (todayMonthBackground) {
      cssRules.push(`.todayMonth { background: ${todayMonthBackground} !important; }`);
    }
    
    if (todayMonthBorderColor) {
      cssRules.push(`.todayMonth { border-color: ${todayMonthBorderColor} !important; }`);
    }
  }
  
  // Month/Week View 样式
  if (config.monthWeekView) {
    const {
      containerBackground, containerGradient, containerOpacity,
      titleFontSize, titleColor, titleFontWeight,
      weekdayBackground, weekdayFontSize, weekdayFontColor, weekdayFontWeight,
      dayCellBackground, dayCellHoverBackground, dayCellBorderColor,
      dayNumberFontSize, dayNumberColor,
      todayBackground, todayBorderColor, todayFontColor,
      lunarFontSize, lunarFontColor, festivalColor, solarTermColor,
      timeSlotBackground, timeSlotFontSize, timeSlotFontColor,
      eventCardBackground, eventCardBorderRadius, eventTitleFontSize, eventTitleColor
    } = config.monthWeekView;
    
    // 容器样式
    if (containerBackground || containerGradient?.enabled) {
      let bgValue = containerBackground || 'var(--bg-primary)';
      if (containerGradient?.enabled) {
        bgValue = `linear-gradient(${containerGradient.angle}deg, ${containerGradient.startColor}, ${containerGradient.endColor})`;
      }
      cssRules.push(`.monthContainer, .weekContainer { background: ${bgValue} !important; }`);
    }
    
    if (containerOpacity !== undefined) {
      cssRules.push(`.monthContainer, .weekContainer { opacity: ${containerOpacity} !important; }`);
    }
    
    // 标题样式
    if (titleFontSize !== undefined) {
      cssRules.push(`.monthHeader, .weekHeader { font-size: ${titleFontSize}rem !important; }`);
    }
    
    if (titleColor) {
      cssRules.push(`.monthHeader, .weekHeader { color: ${titleColor} !important; -webkit-text-fill-color: ${titleColor} !important; }`);
    }
    
    if (titleFontWeight !== undefined) {
      cssRules.push(`.monthHeader, .weekHeader { font-weight: ${titleFontWeight} !important; }`);
    }
    
    // 星期标题样式
    if (weekdayBackground) {
      cssRules.push(`.weekdayRow { background: ${weekdayBackground} !important; }`);
    }
    
    if (weekdayFontSize !== undefined) {
      cssRules.push(`.weekdayHeader { font-size: ${weekdayFontSize}rem !important; }`);
    }
    
    if (weekdayFontColor) {
      cssRules.push(`.weekdayHeader { color: ${weekdayFontColor} !important; }`);
    }
    
    if (weekdayFontWeight !== undefined) {
      cssRules.push(`.weekdayHeader { font-weight: ${weekdayFontWeight} !important; }`);
    }
    
    // 日期单元格样式
    if (dayCellBackground) {
      cssRules.push(`.dayCell { background: ${dayCellBackground} !important; }`);
    }
    
    if (dayCellHoverBackground) {
      cssRules.push(`.dayCell:hover { background: ${dayCellHoverBackground} !important; }`);
    }
    
    if (dayCellBorderColor) {
      cssRules.push(`.dayCell { border-color: ${dayCellBorderColor} !important; }`);
    }
    
    if (dayNumberFontSize !== undefined) {
      cssRules.push(`.dayNumber { font-size: ${dayNumberFontSize}rem !important; }`);
    }
    
    if (dayNumberColor) {
      cssRules.push(`.dayNumber { color: ${dayNumberColor} !important; }`);
    }
    
    // 今天样式
    if (todayBackground) {
      cssRules.push(`.today { background: ${todayBackground} !important; }`);
    }
    
    if (todayBorderColor) {
      cssRules.push(`.today { border-color: ${todayBorderColor} !important; }`);
    }
    
    if (todayFontColor) {
      cssRules.push(`.today .dayNumber { color: ${todayFontColor} !important; }`);
    }
    
    // 农历样式
    if (lunarFontSize !== undefined) {
      cssRules.push(`.lunar { font-size: ${lunarFontSize}rem !important; }`);
    }
    
    if (lunarFontColor) {
      cssRules.push(`.lunar { color: ${lunarFontColor} !important; }`);
    }
    
    if (festivalColor) {
      cssRules.push(`.festival { color: ${festivalColor} !important; }`);
    }
    
    if (solarTermColor) {
      cssRules.push(`.solarTerm { color: ${solarTermColor} !important; }`);
    }
    
    // 周视图时间槽样式
    if (timeSlotBackground) {
      cssRules.push(`.timeSlot { background: ${timeSlotBackground} !important; }`);
    }
    
    if (timeSlotFontSize !== undefined) {
      cssRules.push(`.timeSlot { font-size: ${timeSlotFontSize}rem !important; }`);
    }
    
    if (timeSlotFontColor) {
      cssRules.push(`.timeSlot { color: ${timeSlotFontColor} !important; }`);
    }
    
    // 事件卡片样式
    if (eventCardBackground) {
      cssRules.push(`.eventCard { background: ${eventCardBackground} !important; }`);
    }
    
    if (eventCardBorderRadius !== undefined) {
      cssRules.push(`.eventCard { border-radius: ${eventCardBorderRadius}px !important; }`);
    }
    
    if (eventTitleFontSize !== undefined) {
      cssRules.push(`.eventTitle { font-size: ${eventTitleFontSize}px !important; }`);
    }
    
    if (eventTitleColor) {
      cssRules.push(`.eventTitle { color: ${eventTitleColor} !important; }`);
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