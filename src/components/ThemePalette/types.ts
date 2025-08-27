export interface GlobalStyleConfig {
  backgroundColor?: string;
  backgroundGradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  opacity?: number;
  backgroundImage?: {
    enabled: boolean;
    url: string;
    size: 'cover' | 'contain' | 'auto';
    position: string;
  };
}

export interface YearViewConfig {
  containerBackground?: string;
  containerGradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  containerOpacity?: number;
  borderRadius?: number;
  boxShadow?: string;
  titleFontSize?: number;
  titleColor?: string;
  titleFontWeight?: number;
  backgroundImage?: {
    enabled: boolean;
    url: string;
  };
}

export interface YearSectionConfig {
  currentYearBackground?: string;
  currentYearOpacity?: number;
  fontSize?: number;
  fontColor?: string;
  hoverBackground?: string;
  selectedBackground?: string;
}

export interface MonthCardConfig {
  background?: string;
  backgroundGradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  opacity?: number;
  fontSize?: number;
  fontColor?: string;
  hoverBackground?: string;
  selectedBackground?: string;
  borderColor?: string;
  borderRadius?: number;
  currentMonthBackground?: string;
  currentMonthBorderColor?: string;
  todayMonthBackground?: string;
  todayMonthBorderColor?: string;
}

export interface MonthWeekViewConfig {
  containerBackground?: string;
  containerGradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  containerOpacity?: number;
  titleFontSize?: number;
  titleColor?: string;
  titleFontWeight?: number;
  
  weekdayBackground?: string;
  weekdayFontSize?: number;
  weekdayFontColor?: string;
  weekdayFontWeight?: number;
  
  dayCellBackground?: string;
  dayCellHoverBackground?: string;
  dayCellBorderColor?: string;
  dayNumberFontSize?: number;
  dayNumberColor?: string;
  
  todayBackground?: string;
  todayBorderColor?: string;
  todayFontColor?: string;
  
  lunarFontSize?: number;
  lunarFontColor?: string;
  festivalColor?: string;
  solarTermColor?: string;
  
  timeSlotBackground?: string;
  timeSlotFontSize?: number;
  timeSlotFontColor?: string;
  
  eventCardBackground?: string;
  eventCardBorderRadius?: number;
  eventTitleFontSize?: number;
  eventTitleColor?: string;
}

export interface ThemeConfig {
  global: GlobalStyleConfig;
  yearView: YearViewConfig;
  yearSection: YearSectionConfig;
  monthCard: MonthCardConfig;
  monthWeekView: MonthWeekViewConfig;
}

export interface ThemeHistoryEntry {
  config: ThemeConfig;
  timestamp: number;
}

export interface SavedTheme {
  id?: number;
  name: string;
  config: ThemeConfig;
  createdAt: string;
  updatedAt: string;
}