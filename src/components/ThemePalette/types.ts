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
  borderColor?: string;
  borderRadius?: number;
  todayMonthBackground?: string;
  todayMonthBorderColor?: string;
}

export interface MonthViewConfig {
  containerBackground?: string;
  containerGradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  headerFontSize?: number;
  headerColor?: string;
  
  weekdayBackground?: string;
  weekdayColor?: string;
  
  dayCellBackground?: string;
  dayCellHoverBackground?: string;
  dayNumberSize?: number;
  dayNumberColor?: string;
  
  todayBackground?: string;
  todayColor?: string;
  
  lunarSize?: number;
  lunarColor?: string;
  festivalColor?: string;
  solarTermColor?: string;
}

export interface WeekViewConfig {
  containerBackground?: string;
  headerFontSize?: number;
  headerColor?: string;
  
  dayHeaderBackground?: string;
  dayNameColor?: string;
  dayDateColor?: string;
  
  todayHeaderBackground?: string;
  todayHeaderColor?: string;
  
  timeColumnBackground?: string;
  timeSlotColor?: string;
  timeSlotSize?: number;
  
  hourCellBackground?: string;
  hourCellBorderColor?: string;
  hourCellHoverBackground?: string;
  
  lunarSize?: number;
  lunarColor?: string;
  festivalColor?: string;
  solarTermColor?: string;
}

export interface ThemeConfig {
  global: GlobalStyleConfig;
  yearView: YearViewConfig;
  monthCard: MonthCardConfig;
  monthView: MonthViewConfig;
  weekView: WeekViewConfig;
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